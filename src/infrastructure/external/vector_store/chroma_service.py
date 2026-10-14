"""ChromaDB Vector Store Service for Library Collections."""

from __future__ import annotations

from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository


class ChromaService(ChromaVectorRepository):
    """External service adapter for ChromaDB isolated collections per library / project."""

    def __init__(
        self,
        persist_directory: str = "./data/chroma",
        default_collection_prefix: str = "cf_project_",
    ) -> None:
        super().__init__(
            persist_directory=persist_directory,
            default_collection_prefix=default_collection_prefix,
        )


__all__ = ["ChromaService"]
