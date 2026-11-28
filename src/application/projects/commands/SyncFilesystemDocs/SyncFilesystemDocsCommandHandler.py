"""3-way SHA-256 Docs-as-Code synchronization handler with conflict & deleted-on-disk detection (BR-20)."""

from __future__ import annotations

from pathlib import Path
import time
from typing import Any, Callable, Coroutine

from application.projects.commands.SyncFilesystemDocs.SyncFilesystemDocsCommand import SyncFilesystemDocsCommand
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort, compute_sha256_text
from domain.projects import IProjectRepositoryPort, SyncSummaryVO


class SyncFilesystemDocsCommandHandler:
    def __init__(
        self,
        project_repo: IProjectRepositoryPort,
        doc_repo: IDocumentRepositoryPort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]] | None = None,
    ) -> None:
        self._project_repo = project_repo
        self._doc_repo = doc_repo
        self._index_callback = index_callback

    async def handle(self, request: SyncFilesystemDocsCommand) -> ErrorOr[SyncSummaryVO]:
        t0 = time.perf_counter()
        proj = await self._project_repo.get_by_slug(request.project_slug)
        root_dir = Path(request.target_directory or (proj.path if proj else "./docs"))
        if not root_dir.exists():
            root_dir.mkdir(parents=True, exist_ok=True)
        root_resolved = root_dir.resolve()

        existing_docs = {d.path: d for d in await self._doc_repo.list_all(project_slug=request.project_slug)}
        seen_paths: set[str] = set()
        added = updated = unchanged = archived = conflicted = 0
        conflicted_paths: list[str] = []
        deleted_paths: list[str] = []

        for md_file in sorted(root_resolved.rglob("*.md")):
            if not md_file.resolve().is_relative_to(root_resolved):
                return ErrorOr.fail(DomainError.forbidden("symlink_escape", "Enlace simbólico externo bloqueado (BR-03)."))
            rel_path = md_file.relative_to(root_resolved).as_posix()
            seen_paths.add(rel_path)
            raw_text = md_file.read_text(encoding="utf-8", errors="replace")
            if not raw_text.strip():
                continue
            file_hash = compute_sha256_text(raw_text)
            current = existing_docs.get(rel_path)
            title = _extract_title(raw_text, md_file.stem)
            module_name = rel_path.split("/")[0] if "/" in rel_path else "general"

            if current is None:
                res = DocumentAggregate.create(
                    project_slug=request.project_slug,
                    path=rel_path,
                    title=title,
                    content_markdown=raw_text,
                    module_name=module_name,
                    status=EditorialStatus.PUBLISHED,
                )
                if not res.is_error:
                    agg, ver = res.value
                    agg.mark_synced(file_hash)
                    await self._doc_repo.save(agg, ver, write_to_disk=False)  # type: ignore[call-arg]
                    if self._index_callback:
                        await self._index_callback(agg)
                    added += 1
            elif current.content_hash == file_hash:
                if current.last_synced_hash != file_hash or current.sync_status != "synced":
                    current.mark_synced(file_hash)
                    await self._doc_repo.save(current, None, write_to_disk=False)  # type: ignore[call-arg]
                if self._index_callback and current.status == EditorialStatus.PUBLISHED:
                    await self._index_callback(current)
                unchanged += 1
            elif (
                current.last_synced_hash
                and current.content_hash != current.last_synced_hash
                and file_hash != current.last_synced_hash
            ):
                # BR-20 3-way conflict: BOTH DB/UI and Disk diverged since last_synced_hash — NEVER overwrite silently!
                current.mark_sync_conflict()
                await self._doc_repo.save(current, None, write_to_disk=False)  # type: ignore[call-arg]
                conflicted += 1
                conflicted_paths.append(rel_path)
            else:
                edit_res = current.apply_edit(
                    title=title,
                    content_markdown=raw_text,
                    change_summary="Sincronización Docs-as-Code SHA-256",
                    explicit_unlock=True,
                )
                if not edit_res.is_error:
                    current.mark_synced(file_hash)
                    await self._doc_repo.save(current, edit_res.value, write_to_disk=False)  # type: ignore[call-arg]
                    if self._index_callback and current.status == EditorialStatus.PUBLISHED:
                        await self._index_callback(current)
                    updated += 1

        # Detect previously synced documents whose backing file was deleted on disk (preserve DB history, mark deleted_on_disk)
        for rel_path, doc in existing_docs.items():
            if rel_path not in seen_paths and doc.last_synced_hash:
                if doc.sync_status != "deleted_on_disk":
                    doc.mark_deleted_on_disk()
                    await self._doc_repo.save(doc, None, write_to_disk=False)  # type: ignore[call-arg]
                deleted_paths.append(rel_path)
                archived += 1

        duration = round((time.perf_counter() - t0) * 1000.0, 2)
        return ErrorOr.ok(
            SyncSummaryVO(
                project_slug=request.project_slug,
                added_count=added,
                updated_count=updated,
                unchanged_count=unchanged,
                archived_count=archived,
                duration_ms=duration,
                conflicted_count=conflicted,
                conflicted_paths=tuple(conflicted_paths),
                deleted_on_disk_paths=tuple(deleted_paths),
            )
        )


def _extract_title(markdown_text: str, fallback: str) -> str:
    for line in markdown_text.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s[2:].strip()[:200]
    return fallback.replace("_", " ").replace("-", " ").title()[:200]
