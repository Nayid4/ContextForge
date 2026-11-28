"""Document Aggregate Root enforcing governance, ETag concurrency, versioning & editorial lifecycle."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import re
import uuid

from domain.common import AggregateRoot, DomainError, ErrorOr
from domain.documents.document_policies import compute_sha256_text
from domain.documents.document_updated_event import DocumentUpdatedEvent
from domain.documents.document_version_entity import DocumentVersionEntity
from domain.documents.editorial_state_machine import EditorialStateMachine
from domain.documents.editorial_status import EditorialStatus
from domain.documents.standard_governance_pipeline import StandardGovernancePipeline


class DocumentAggregate(AggregateRoot):
    def __init__(
        self,
        *,
        id: str,
        project_slug: str,
        module_name: str,
        slug: str,
        title: str,
        path: str,
        author: str,
        tags: tuple[str, ...],
        summary: str,
        content_markdown: str,
        status: EditorialStatus = EditorialStatus.PUBLISHED,
        is_locked: bool = False,
        current_version: int = 1,
        published_version: int | None = None,
        content_hash: str | None = None,
        last_synced_hash: str = "",
        sync_status: str = "synced",
        steward_user_id: str = "",
        review_interval_days: int = 90,
        last_reviewed_at: datetime | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__()
        self.id = id
        self.project_slug = project_slug
        self.module_name = module_name
        self.slug = slug
        self.title = title
        self.path = path.strip().replace("\\", "/")
        self.author = author
        self.tags = tuple(tags)
        self.summary = summary
        self.content_markdown = content_markdown
        self.status = status
        self.is_locked = is_locked
        self.current_version = current_version
        self.published_version = published_version if published_version is not None else (current_version if status == EditorialStatus.PUBLISHED else None)
        self.content_hash = content_hash or compute_sha256_text(content_markdown)
        self.last_synced_hash = last_synced_hash
        self.sync_status = sync_status or "synced"
        self.steward_user_id = steward_user_id or ""
        self.review_interval_days = max(7, min(730, int(review_interval_days or 90)))
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
        self.last_reviewed_at = last_reviewed_at or (self.updated_at if status == EditorialStatus.PUBLISHED else None)

    @property
    def freshness_status(self) -> str:
        """Evaluates document freshness against review_interval_days (BR-24): fresh | expiring_soon | expired."""
        if self.status != EditorialStatus.PUBLISHED:
            return "fresh"
        ref = self.last_reviewed_at or self.updated_at
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        age = now - ref
        limit = timedelta(days=self.review_interval_days)
        if age > limit:
            return "expired"
        if age >= limit - timedelta(days=min(14, max(3, self.review_interval_days // 5))):
            return "expiring_soon"
        return "fresh"

    @property
    def is_expired(self) -> bool:
        return self.freshness_status == "expired"

    def update_governance(
        self,
        *,
        steward_user_id: str | None = None,
        review_interval_days: int | None = None,
        mark_reviewed: bool = False,
    ) -> None:
        if steward_user_id is not None:
            self.steward_user_id = steward_user_id.strip()
        if review_interval_days is not None:
            self.review_interval_days = max(7, min(730, int(review_interval_days)))
        if mark_reviewed:
            self.last_reviewed_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

    def mark_synced(self, disk_hash: str) -> None:
        self.last_synced_hash = disk_hash
        self.sync_status = "synced"

    def mark_sync_conflict(self) -> None:
        self.sync_status = "in_conflict"
        self.updated_at = datetime.now(timezone.utc)

    def mark_deleted_on_disk(self) -> None:
        self.sync_status = "deleted_on_disk"
        self.updated_at = datetime.now(timezone.utc)

    @property
    def etag(self) -> str:
        return f'W/"v{self.current_version}-{self.content_hash[:12]}"'

    @property
    def word_count(self) -> int:
        return len(re.findall(r"\b\w+\b", self.content_markdown))

    @property
    def reading_time_minutes(self) -> int:
        w = self.word_count
        return max(1, round(w / 200)) if w > 0 else 0

    @classmethod
    def create(
        cls,
        *,
        project_slug: str,
        path: str,
        title: str,
        content_markdown: str,
        module_name: str = "general",
        author: str = "system",
        tags: tuple[str, ...] | list[str] = (),
        status: EditorialStatus = EditorialStatus.PUBLISHED,
        summary: str = "",
        governance: StandardGovernancePipeline | None = None,
    ) -> ErrorOr[tuple[DocumentAggregate, DocumentVersionEntity]]:
        pipeline = governance or StandardGovernancePipeline()
        val = pipeline.validate(path, title, content_markdown)
        if val.is_error:
            return ErrorOr.fail(*val.errors)
        clean_path = path.strip().replace("\\", "/")
        doc_id = str(uuid.uuid4())
        slug = re.sub(r"[^a-z0-9_-]+", "_", title.strip().lower()).strip("_") or "doc"
        c_hash = compute_sha256_text(content_markdown)
        doc = cls(
            id=doc_id,
            project_slug=project_slug,
            module_name=module_name.strip() or "general",
            slug=slug,
            title=title.strip(),
            path=clean_path,
            author=author.strip() or "system",
            tags=tuple(t.strip() for t in tags if t.strip()),
            summary=summary.strip(),
            content_markdown=content_markdown,
            status=status,
            is_locked=False,
            current_version=1,
            content_hash=c_hash,
        )
        v1 = DocumentVersionEntity(
            version_id=str(uuid.uuid4()),
            book_id=doc.id,
            version_number=1,
            content_markdown=content_markdown,
            content_hash=c_hash,
            author_id=doc.author,
            status_snapshot=status.value,
            change_summary="Versión inicial",
        )
        doc.record_event(
            DocumentUpdatedEvent(
                doc_id=doc.id,
                project_slug=doc.project_slug,
                path=doc.path,
                version_number=1,
                status=doc.status.value,
                action="created",
            )
        )
        return ErrorOr.ok((doc, v1))

    def apply_edit(
        self,
        *,
        title: str,
        content_markdown: str,
        module_name: str | None = None,
        tags: tuple[str, ...] | list[str] | None = None,
        summary: str | None = None,
        author: str = "system",
        expected_version: int | None = None,
        is_locked: bool | None = None,
        explicit_unlock: bool = False,
        create_draft_revision: bool = False,
        change_summary: str = "Actualización documental",
        governance: StandardGovernancePipeline | None = None,
    ) -> ErrorOr[DocumentVersionEntity]:
        if self.status == EditorialStatus.DEPRECATED:
            return ErrorOr.fail(
                DomainError.locked(
                    "deprecated_document_readonly",
                    "Un documento en estado 'deprecated' es de solo lectura (BR-05).",
                )
            )
        if self.is_locked and not explicit_unlock:
            return ErrorOr.fail(
                DomainError.locked(
                    "document_locked",
                    "El documento está bloqueado para edición. Desbloquéalo explícitamente primero.",
                )
            )
        if expected_version is not None and expected_version != self.current_version:
            return ErrorOr.fail(
                DomainError.conflict(
                    "concurrent_modification",
                    f"Conflicto de concurrencia optimista: se esperaba v{expected_version}, pero el servidor tiene v{self.current_version} (BR-11).",
                    expected_version=expected_version,
                    actual_version=self.current_version,
                    current_etag=self.etag,
                )
            )
        pipeline = governance or StandardGovernancePipeline()
        val = pipeline.validate(self.path, title, content_markdown)
        if val.is_error:
            return ErrorOr.fail(*val.errors)

        if create_draft_revision and self.status == EditorialStatus.PUBLISHED:
            # BR-04: Preserve live published_version pointer while creating a new draft revision
            self.published_version = self.published_version or self.current_version
            self.status = EditorialStatus.DRAFT

        self.title = title.strip()
        self.content_markdown = content_markdown
        if module_name is not None and module_name.strip():
            self.module_name = module_name.strip()
        if tags is not None:
            self.tags = tuple(t.strip() for t in tags if t.strip())
        if summary is not None:
            self.summary = summary.strip()
        if is_locked is not None:
            self.is_locked = is_locked
        elif explicit_unlock:
            self.is_locked = False

        self.current_version += 1
        if self.status == EditorialStatus.PUBLISHED:
            self.published_version = self.current_version
        self.content_hash = compute_sha256_text(content_markdown)
        self.updated_at = datetime.now(timezone.utc)

        ver = DocumentVersionEntity(
            version_id=str(uuid.uuid4()),
            book_id=self.id,
            version_number=self.current_version,
            content_markdown=self.content_markdown,
            content_hash=self.content_hash,
            author_id=author.strip() or self.author,
            status_snapshot=self.status.value,
            change_summary=change_summary.strip() or "Actualización documental",
        )
        self.record_event(
            DocumentUpdatedEvent(
                doc_id=self.id,
                project_slug=self.project_slug,
                path=self.path,
                version_number=self.current_version,
                status=self.status.value,
                action="updated",
            )
        )
        return ErrorOr.ok(ver)

    def transition_to(
        self,
        target_status: EditorialStatus,
        *,
        actor: str = "system",
        reason: str = "",
    ) -> ErrorOr[DocumentVersionEntity]:
        chk = EditorialStateMachine.validate_transition(self.status, target_status)
        if chk.is_error:
            return ErrorOr.fail(*chk.errors)
        prev = self.status
        self.status = target_status
        self.current_version += 1
        if target_status == EditorialStatus.PUBLISHED:
            self.published_version = self.current_version
            self.last_reviewed_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        summary = f"Transición editorial: {prev.value} -> {target_status.value}"
        if reason.strip():
            summary += f" ({reason.strip()})"
        ver = DocumentVersionEntity(
            version_id=str(uuid.uuid4()),
            book_id=self.id,
            version_number=self.current_version,
            content_markdown=self.content_markdown,
            content_hash=self.content_hash,
            author_id=actor.strip() or self.author,
            status_snapshot=self.status.value,
            change_summary=summary,
        )
        self.record_event(
            DocumentUpdatedEvent(
                doc_id=self.id,
                project_slug=self.project_slug,
                path=self.path,
                version_number=self.current_version,
                status=self.status.value,
                action="transitioned",
            )
        )
        return ErrorOr.ok(ver)

    def rollback_to_snapshot(
        self,
        snapshot: DocumentVersionEntity,
        *,
        actor: str = "system",
        reason: str = "Rollback editorial",
    ) -> ErrorOr[DocumentVersionEntity]:
        if self.status == EditorialStatus.DEPRECATED:
            return ErrorOr.fail(
                DomainError.locked(
                    "deprecated_document_readonly",
                    "No se puede revertir un documento en estado 'deprecated' (BR-05).",
                )
            )
        self.content_markdown = snapshot.content_markdown
        self.content_hash = snapshot.content_hash
        self.current_version += 1
        self.updated_at = datetime.now(timezone.utc)
        ver = DocumentVersionEntity(
            version_id=str(uuid.uuid4()),
            book_id=self.id,
            version_number=self.current_version,
            content_markdown=self.content_markdown,
            content_hash=self.content_hash,
            author_id=actor.strip() or self.author,
            status_snapshot=self.status.value,
            change_summary=f"Rollback no destructivo a v{snapshot.version_number}: {reason.strip()}",
        )
        self.record_event(
            DocumentUpdatedEvent(
                doc_id=self.id,
                project_slug=self.project_slug,
                path=self.path,
                version_number=self.current_version,
                status=self.status.value,
                action="rolled_back",
            )
        )
        return ErrorOr.ok(ver)
