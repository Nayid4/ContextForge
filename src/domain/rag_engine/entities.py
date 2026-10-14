"""RAG Engine Domain Entities."""

from __future__ import annotations

from dataclasses import dataclass, field
from domain.shared_kernel.entities import Entity


@dataclass(frozen=True)
class Citation:
    """Explicit source attribution for a retrieved chunk."""

    file_path: str
    header: str = ""
    snippet: str = ""

    def format_pill(self) -> str:
        name = self.file_path.split("/")[-1]
        return f"[{name}]"


@dataclass(frozen=True)
class RetrievalResult:
    """Ranked search result from dense or lexical retrieval."""

    chunk_id: str
    text: str
    file_path: str
    relevance_score: float
    source_type: str  # 'dense' | 'lexical' | 'hybrid'
    header_hierarchy: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class VectorEmbedding:
    """Dense vector embedding for a chunk."""

    chunk_id: str
    vector: list[float]
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass
class PromptContext(Entity):
    """Context assembled to feed the local LLM."""

    query: str = ""
    prompt_text: str = ""
    citations: list[Citation] = field(default_factory=list)
    total_tokens: int = 0

