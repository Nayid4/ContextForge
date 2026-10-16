"""Local FileSystem Repository for Docs-as-Code with Multi-Project Support."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
import aiofiles
import frontmatter
from domain.knowledge_docs.entities import Document, DocumentChunk
from domain.knowledge_docs.repositories import IDocumentRepository


class LocalFileSystemRepository(IDocumentRepository):
    """Scans and persists Markdown documents from the local docs directory with project isolation."""

    def __init__(self, base_path: str = "./docs") -> None:
        self._base_path = Path(base_path)

    async def list_all(
        self,
        module: str | None = None,
        search: str | None = None,
        project_slug: str | None = None,
    ) -> list[Document]:
        """List documents matching filters, optionally isolated by project_slug."""
        if not self._base_path.exists():
            return []

        documents: list[Document] = []

        if project_slug and project_slug != "all":
            if project_slug == "default":
                search_roots = [self._base_path]
            else:
                project_dir = self._base_path / project_slug
                if project_dir.exists() and project_dir.is_dir():
                    search_roots = [project_dir]
                else:
                    search_roots = [self._base_path]
        else:
            search_roots = [self._base_path]

        seen_paths: set[str] = set()
        for s_root in search_roots:
            for root, dirs, files in os.walk(s_root):
                if project_slug == "default" and s_root == self._base_path:
                    dirs[:] = [
                        d for d in dirs
                        if d == "default" or not (self._base_path / d / "project.json").exists()
                    ]
                for file in files:
                    if file.endswith(".md"):
                        full_path = Path(root) / file
                        rel_path = full_path.relative_to(self._base_path).as_posix()
                        if rel_path in seen_paths:
                            continue
                        doc = await self.get_by_path(rel_path, project_slug=project_slug)
                        if doc:
                            if project_slug and project_slug != "all" and doc.project_slug != project_slug:
                                continue
                            if module and doc.module != module:
                                continue
                            if search and search.strip():
                                s_term = search.strip().lower()
                                if s_term not in doc.title.lower() and s_term not in doc.content_markdown.lower():
                                    continue
                            seen_paths.add(rel_path)
                            documents.append(doc)

        return sorted(documents, key=lambda d: d.path)

    async def list_paged(
        self,
        module: str | None = None,
        search: str | None = None,
        project_slug: str | None = None,
        page: int = 1,
        per_page: int = 9,
    ) -> tuple[list[Document], int]:
        """Return paginated slice of documents and total matching count."""
        all_docs = await self.list_all(module=module, search=search, project_slug=project_slug)
        total_count = len(all_docs)
        safe_page = max(1, page)
        safe_per_page = max(1, per_page)
        start = (safe_page - 1) * safe_per_page
        end = start + safe_per_page
        return all_docs[start:end], total_count

    async def get_by_path(
        self,
        relative_path: str,
        project_slug: str | None = None,
    ) -> Document | None:
        """Retrieve and parse a document by relative path, inferring project and module."""
        clean_rel = relative_path.replace("\\", "/").strip("/")
        full_path = self._base_path / clean_rel

        if not full_path.exists() and project_slug and project_slug != "default":
            candidate = self._base_path / project_slug / clean_rel
            if candidate.exists():
                full_path = candidate
                clean_rel = f"{project_slug}/{clean_rel}"

        if not full_path.exists() or not full_path.is_file():
            return None

        async with aiofiles.open(full_path, mode="r", encoding="utf-8") as f:
            raw_text = await f.read()

        parsed = frontmatter.loads(raw_text)
        metadata = parsed.metadata

        # Infer project_slug
        inferred_project = str(
            metadata.get("project_slug")
            or metadata.get("project")
            or project_slug
            or self._detect_project_slug_from_path(clean_rel)
        )

        # Infer module
        parts = clean_rel.split("/")
        if "module" in metadata:
            mod = str(metadata["module"])
        elif len(parts) >= 3 and parts[0] == inferred_project:
            mod = parts[1]
        elif len(parts) >= 2 and parts[0] != inferred_project:
            mod = parts[0]
        else:
            mod = "general"

        title = str(metadata.get("title", parts[-1].replace(".md", "")))
        raw_tags = metadata.get("tags", [])
        tags = [str(t) for t in raw_tags] if isinstance(raw_tags, list) else [str(raw_tags)]
        author = str(metadata.get("author", "Equipo Técnico"))
        content = parsed.content

        chunks = self._chunk_markdown(
            rel_path=clean_rel,
            content=content,
            module=mod,
            tags=tags,
            project_slug=inferred_project,
            title=title,
        )

        # Scan for linked document attachments in assets/{doc_stem} or ./docs/{project}/assets/{doc_stem}
        doc_stem = full_path.stem
        candidates = [
            full_path.parent / "assets" / doc_stem,
            self._base_path / inferred_project / "assets" / doc_stem,
        ]
        from infrastructure.external.extractors import MultiFormatExtractor

        extractor = MultiFormatExtractor()
        seen_assets: set[str] = set()
        for cand in candidates:
            if cand.exists() and cand.is_dir():
                for asset_file in cand.iterdir():
                    if asset_file.is_file() and asset_file.name not in seen_assets:
                        seen_assets.add(asset_file.name)
                        extracted = extractor.extract(str(asset_file))
                        for item in extracted:
                            txt = item.get("text", "").strip()
                            if txt:
                                chunks.append(
                                    DocumentChunk(
                                        project_slug=inferred_project,
                                        document_path=clean_rel,
                                        header_hierarchy=[title, asset_file.name],
                                        header_level="h3",
                                        text=txt,
                                        token_count=len(txt.split()),
                                        module=mod,
                                        tags=tags + ["attachment"],
                                        source_type="attachment",
                                        parent_doc_path=clean_rel,
                                        attachment_name=asset_file.name,
                                        location=item.get("location", "Anexo"),
                                    )
                                )

        return Document(
            id=clean_rel,
            path=clean_rel,
            title=title,
            module=mod,
            tags=tags,
            content_markdown=content,
            author=author,
            project_slug=inferred_project,
            chunks=chunks,
        )


    async def save_document(
        self,
        relative_path: str,
        content: str,
        project_slug: str | None = None,
    ) -> Document:
        """Persist a Markdown document in the filesystem under project-isolated directory."""
        clean_rel = relative_path.replace("\\", "/").strip("/")
        if project_slug and project_slug != "default" and not clean_rel.startswith(f"{project_slug}/"):
            target_rel = f"{project_slug}/{clean_rel}"
        else:
            target_rel = clean_rel

        full_path = self._base_path / target_rel
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, mode="w", encoding="utf-8") as f:
            await f.write(content)

        doc = await self.get_by_path(target_rel, project_slug=project_slug)
        if not doc:
            raise RuntimeError(f"Failed to read saved document at {target_rel}")
        return doc

    def get_project_metadata(self, project_slug: str) -> dict[str, Any] | None:
        """Read project.json metadata file if it exists."""
        meta_file = self._base_path / project_slug / "project.json"
        if not meta_file.exists():
            return None
        with open(meta_file, mode="r", encoding="utf-8") as f:
            data: dict[str, Any] = json.load(f)
            return data

    def save_project_metadata(self, project_slug: str, data: dict[str, Any]) -> None:
        """Write project.json metadata file for the project."""
        proj_dir = self._base_path / project_slug
        proj_dir.mkdir(parents=True, exist_ok=True)
        meta_file = proj_dir / "project.json"
        with open(meta_file, mode="w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def list_project_slugs(self) -> list[str]:
        """Detect all project slugs within the base docs directory."""
        if not self._base_path.exists():
            return []
        slugs: list[str] = []
        for item in self._base_path.iterdir():
            if item.is_dir() and not item.name.startswith("."):
                # Check if it has project.json or contains markdown files
                meta_file = item / "project.json"
                if meta_file.exists():
                    slugs.append(item.name)
                else:
                    # check if any markdown file exists inside
                    has_md = any(item.glob("**/*.md"))
                    if has_md and item.name not in {"architecture", "modules", "troubleshooting", "bundles"}:
                        slugs.append(item.name)
        return sorted(slugs)

    def _detect_project_slug_from_path(self, rel_path: str) -> str:
        """Detect project slug from relative path or fallback to default."""
        parts = rel_path.split("/")
        if len(parts) >= 2:
            first_segment = parts[0]
            # If first segment has a project.json or is a recognized project folder
            if (self._base_path / first_segment / "project.json").exists():
                return first_segment
            # If first segment is not standard top-level legacy folder
            if first_segment not in {"architecture", "modules", "troubleshooting", "general"}:
                return first_segment
        return "default"

    def _chunk_markdown(
        self,
        rel_path: str,
        content: str,
        module: str,
        tags: list[str],
        project_slug: str,
        title: str = "",
    ) -> list[DocumentChunk]:
        """Split markdown content into chunks respecting headings and preserving code blocks."""
        lines = content.split("\n")
        chunks: list[DocumentChunk] = []

        doc_title = title.strip() or rel_path.split("/")[-1]
        current_header = [doc_title]
        current_header_level = "h2"
        current_lines: list[str] = []
        in_code_block = False

        for line in lines:
            if line.startswith("```"):
                in_code_block = not in_code_block

            if not in_code_block and line.startswith("#"):
                # Heading boundary
                if current_lines:
                    text_chunk = "\n".join(current_lines).strip()
                    if text_chunk:
                        chunks.append(
                            DocumentChunk(
                                project_slug=project_slug,
                                document_path=rel_path,
                                header_hierarchy=list(current_header),
                                header_level=current_header_level,
                                text=text_chunk,
                                token_count=len(text_chunk.split()),
                                module=module,
                                tags=tags,
                            )
                        )
                    current_lines = []

                # Count leading hashtags for header level (e.g. # -> h1, ## -> h2, ### -> h3)
                hashes = len(line) - len(line.lstrip("#"))
                current_header_level = f"h{min(max(hashes, 1), 6)}"
                header_text = line.lstrip("#").strip()
                if header_text and header_text != doc_title:
                    current_header = [doc_title, header_text]
                else:
                    current_header = [doc_title]
            else:
                current_lines.append(line)

        if current_lines:
            text_chunk = "\n".join(current_lines).strip()
            if text_chunk:
                chunks.append(
                    DocumentChunk(
                        project_slug=project_slug,
                        document_path=rel_path,
                        header_hierarchy=list(current_header),
                        header_level=current_header_level,
                        text=text_chunk,
                        token_count=len(text_chunk.split()),
                        module=module,
                        tags=tags,
                    )
                )

        return chunks
