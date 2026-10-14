"""ChromaDB Vector Repository Implementation with Dynamic Multi-Project Collections."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any
import chromadb
from chromadb.api import ClientAPI
from domain.knowledge_docs.entities import DocumentChunk
from domain.rag_engine.entities import RetrievalResult
from domain.rag_engine.repositories import IVectorRepository

logger = logging.getLogger(__name__)


class ChromaVectorRepository(IVectorRepository):
    """Persistent ChromaDB vector repository with strict collection isolation per project."""

    def __init__(
        self,
        persist_directory: str = "./data/chroma",
        default_collection_prefix: str = "cf_project_",
    ) -> None:
        Path(persist_directory).mkdir(parents=True, exist_ok=True)
        self._persist_directory = persist_directory
        self._prefix = default_collection_prefix
        self._client: ClientAPI = chromadb.PersistentClient(path=persist_directory)

    def _get_collection_name(self, project_slug: str) -> str:
        """Format collection name per project specification (cf_project_{slug})."""
        clean_slug = project_slug.strip().lower() or "default"
        return f"{self._prefix}{clean_slug}"

    def _get_or_create_collection(self, project_slug: str) -> Any:
        col_name = self._get_collection_name(project_slug)
        return self._client.get_or_create_collection(
            name=col_name,
            metadata={"hnsw:space": "cosine"},
        )

    async def upsert_chunks(
        self,
        chunks: list[DocumentChunk],
        project_slug: str = "default",
        embeddings: list[list[float]] | None = None,
    ) -> None:
        if not chunks:
            return

        # Target project slug for this batch
        target_slug = chunks[0].project_slug if chunks[0].project_slug else project_slug
        collection = self._get_or_create_collection(target_slug)

        ids = [f"{c.document_path}_{i}" for i, c in enumerate(chunks)]
        documents = [c.text for c in chunks]
        metadatas = [c.to_metadata_dict() for c in chunks]

        try:
            if embeddings:
                collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings,
                )
            else:
                collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                )
        except Exception as e:
            if "dimension" in str(e).lower():
                # Recreate project collection if dimension mismatch with stale data
                col_name = self._get_collection_name(target_slug)
                self._client.delete_collection(col_name)
                coll_recreated: Any = self._client.get_or_create_collection(
                    name=col_name,
                    metadata={"hnsw:space": "cosine"},
                )
                if embeddings:
                    coll_recreated.upsert(
                        ids=ids,
                        documents=documents,
                        metadatas=metadatas,
                        embeddings=embeddings,
                    )
                else:
                    coll_recreated.upsert(
                        ids=ids,
                        documents=documents,
                        metadatas=metadatas,
                    )
            else:
                raise

    async def search(
        self,
        query: str,
        project_slug: str = "default",
        top_k: int = 5,
        query_vector: list[float] | None = None,
    ) -> list[RetrievalResult]:
        col_name = self._get_collection_name(project_slug)
        try:
            collection = self._client.get_collection(col_name)
            cnt = collection.count()
            if cnt == 0:
                return []

            n_results = min(top_k, cnt)
            if query_vector:
                results = collection.query(
                    query_embeddings=[query_vector],  # type: ignore[arg-type]
                    n_results=n_results,
                    include=["documents", "metadatas", "distances"],
                )
            else:
                results = collection.query(
                    query_texts=[query],
                    n_results=n_results,
                    include=["documents", "metadatas", "distances"],
                )
        except Exception as exc:
            logger.warning("Chroma query failed for collection '%s': %s", col_name, exc)
            return []

        output: list[RetrievalResult] = []
        if not results["ids"] or not results["ids"][0]:
            return output

        ids = results["ids"][0]
        docs = results["documents"][0] if results["documents"] else []
        metas = results["metadatas"][0] if results["metadatas"] else []
        dists = results["distances"][0] if results["distances"] else []

        for chunk_id, doc_text, meta, distance in zip(ids, docs, metas, dists):
            meta_dict = meta if isinstance(meta, dict) else {}
            # Cosine distance to similarity: similarity = 1 - distance
            similarity = max(0.0, 1.0 - float(distance))
            header_str = str(meta_dict.get("title", ""))
            headers = [header_str] if header_str else []

            output.append(
                RetrievalResult(
                    chunk_id=chunk_id,
                    text=doc_text or "",
                    file_path=str(meta_dict.get("file_path", "")),
                    relevance_score=round(similarity, 4),
                    source_type="dense",
                    header_hierarchy=headers,
                )
            )

        return output

    async def count(self, project_slug: str = "default") -> int:
        col_name = self._get_collection_name(project_slug)
        try:
            collection = self._client.get_collection(col_name)
            return int(collection.count())
        except Exception:
            return 0

    async def clear_project(self, project_slug: str = "default") -> None:
        """Clear all chunks from project's collection without dropping the collection itself."""
        col_name = self._get_collection_name(project_slug)
        try:
            collection = self._client.get_collection(col_name)
            existing = collection.get()
            if existing and existing["ids"]:
                collection.delete(ids=existing["ids"])
        except Exception:
            pass

    async def delete_project(self, project_slug: str) -> None:
        """Drop collection for given project."""
        col_name = self._get_collection_name(project_slug)
        try:
            self._client.delete_collection(col_name)
        except Exception:
            pass

    def list_collections(self) -> list[str]:
        """List all collection names in ChromaDB."""
        raw = self._client.list_collections()
        names: list[str] = []
        for item in raw:
            if isinstance(item, str):
                names.append(item)
            elif hasattr(item, "name"):
                names.append(str(item.name))
        return sorted(names)

    async def search_scoped(
        self,
        library_id: str,
        book_id: str,
        query: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Scoped search restricted strictly to a specific document and its attachments."""
        col_name = self._get_collection_name(library_id)
        try:
            collection = self._client.get_collection(col_name)
        except Exception:
            return []

        clean_id = book_id.replace("\\", "/").strip("/")
        base_name = Path(clean_id).name

        try:
            results = collection.query(
                query_texts=[query],
                n_results=limit * 2,
                include=["documents", "metadatas", "distances"],
            )
        except Exception as exc:
            logger.warning("Scoped search query failed on '%s': %s", col_name, exc)
            return []

        if not results["ids"] or not results["ids"][0]:
            return []

        output: list[dict[str, Any]] = []
        docs = results["documents"][0] if results["documents"] else []
        metas = results["metadatas"][0] if results["metadatas"] else []

        for doc_text, meta in zip(docs, metas):
            meta_dict = meta if isinstance(meta, dict) else {}
            file_path = str(meta_dict.get("file_path", "")).replace("\\", "/").strip("/")
            parent_doc = str(meta_dict.get("parent_doc_path", "")).replace("\\", "/").strip("/")

            matches = (
                clean_id in file_path
                or base_name in file_path
                or clean_id in parent_doc
                or base_name in parent_doc
            )
            if matches:
                output.append({
                    "text": doc_text or "",
                    "metadata": meta_dict,
                })
                if len(output) >= limit:
                    break

        # Fallback if no specific prefix match
        if not output and docs:
            for doc_text, meta in zip(docs[:limit], metas[:limit]):
                output.append({
                    "text": doc_text or "",
                    "metadata": meta if isinstance(meta, dict) else {},
                })

        return output

