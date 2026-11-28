"""GoF Creational Factories for Chunking, Ranking, and Retrieval orchestration."""

from __future__ import annotations

from contextforge._internal.strategies import (
    HeadingAwareChunkingStrategy,
    ReciprocalRankFusionStrategy,
    SlidingWindowChunkingStrategy,
    WeightedLinearRankingStrategy,
)
from contextforge.contracts import (
    IChunkingStrategy,
    IHybridRankingStrategy,
    ILexicalStore,
    IVectorStore,
)
from contextforge.exceptions import UnknownStrategyError
from contextforge.models import SearchHit


class StrategyFactory:
    """Registry Factory for creating/resolving chunking and hybrid ranking strategies."""

    def __init__(self, max_chunk_chars: int = 800, chunk_overlap_chars: int = 120) -> None:
        self._chunkers: dict[str, IChunkingStrategy] = {}
        self._rankers: dict[str, IHybridRankingStrategy] = {}

        self.register_chunker(HeadingAwareChunkingStrategy(max_chars=max_chunk_chars))
        self.register_chunker(
            SlidingWindowChunkingStrategy(window_chars=max_chunk_chars, overlap_chars=chunk_overlap_chars)
        )
        self.register_ranker(ReciprocalRankFusionStrategy())
        self.register_ranker(WeightedLinearRankingStrategy())

    def register_chunker(self, strategy: IChunkingStrategy, alias: str | None = None) -> None:
        self._chunkers[(alias or strategy.name).strip().lower()] = strategy

    def register_ranker(self, strategy: IHybridRankingStrategy, alias: str | None = None) -> None:
        self._rankers[(alias or strategy.name).strip().lower()] = strategy

    def get_chunker(self, name: str) -> IChunkingStrategy:
        key = name.strip().lower()
        strategy = self._chunkers.get(key)
        if strategy is None:
            raise UnknownStrategyError(name, kind="chunking strategy")
        return strategy

    def get_ranker(self, name: str) -> IHybridRankingStrategy:
        key = name.strip().lower()
        strategy = self._rankers.get(key)
        if strategy is None:
            raise UnknownStrategyError(name, kind="ranking strategy")
        return strategy

    @property
    def chunker_names(self) -> tuple[str, ...]:
        return tuple(sorted(self._chunkers.keys()))

    @property
    def ranker_names(self) -> tuple[str, ...]:
        return tuple(sorted(self._rankers.keys()))


class RetrieverFactory:
    """Creates retrieval execution flows for ``lexical``, ``vector``, and ``hybrid`` modes."""

    VALID_MODES = ("lexical", "vector", "hybrid")

    def __init__(
        self,
        lexical_store: ILexicalStore,
        vector_store: IVectorStore,
        strategy_factory: StrategyFactory,
    ) -> None:
        self._lexical = lexical_store
        self._vector = vector_store
        self._strategies = strategy_factory

    def retrieve(
        self,
        query: str,
        *,
        top_k: int,
        mode: str,
        ranking_strategy: str,
    ) -> list[SearchHit]:
        normalized = mode.strip().lower()
        if normalized not in self.VALID_MODES:
            raise UnknownStrategyError(mode, kind="retrieval mode")

        if normalized == "lexical":
            return self._lexical.search(query, top_k=top_k)
        if normalized == "vector":
            return self._vector.search(query, top_k=top_k)

        candidate_k = max(top_k * 2, 10)
        lex_hits = self._lexical.search(query, top_k=candidate_k)
        vec_hits = self._vector.search(query, top_k=candidate_k)
        ranker = self._strategies.get_ranker(ranking_strategy)
        return ranker.fuse(lex_hits, vec_hits, top_k=top_k)
