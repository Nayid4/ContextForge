"""GoF Creational Builder for fluent assembly of :class:`ContextForge` instances."""

from __future__ import annotations

from contextforge.client import ContextForge
from contextforge.contracts import (
    IBundleExporter,
    IChunkingStrategy,
    IDocumentRule,
    IHybridRankingStrategy,
    IKnowledgeObserver,
    ILexicalStore,
    ILLMProvider,
    IVectorStore,
)
from contextforge.models import ContextForgeConfig


class ContextForgeBuilder:
    """Fluent Builder (GoF Creational) for configuring and extending :class:`ContextForge`.

    Example:
        >>> engine = (
        ...     ContextForgeBuilder()
        ...     .with_config(ContextForgeConfig(default_ranking_strategy="weighted"))
        ...     .with_llm_provider(my_llm)
        ...     .with_exporter(my_yaml_exporter)
        ...     .build()
        ... )
    """

    def __init__(self) -> None:
        self._config: ContextForgeConfig | None = None
        self._lexical: ILexicalStore | None = None
        self._vector: IVectorStore | None = None
        self._llm: ILLMProvider | None = None
        self._chunkers: list[tuple[IChunkingStrategy, str | None]] = []
        self._rankers: list[tuple[IHybridRankingStrategy, str | None]] = []
        self._exporters: list[tuple[IBundleExporter, str | None]] = []
        self._rules: list[IDocumentRule] = []
        self._observers: list[IKnowledgeObserver] = []

    def with_config(self, config: ContextForgeConfig) -> ContextForgeBuilder:
        """Attach an immutable :class:`ContextForgeConfig`."""
        self._config = config
        return self

    def with_stores(
        self,
        *,
        lexical_store: ILexicalStore | None = None,
        vector_store: IVectorStore | None = None,
    ) -> ContextForgeBuilder:
        """Inject custom or fake :class:`ILexicalStore` / :class:`IVectorStore` implementations."""
        if lexical_store is not None:
            self._lexical = lexical_store
        if vector_store is not None:
            self._vector = vector_store
        return self

    def with_llm_provider(self, provider: ILLMProvider) -> ContextForgeBuilder:
        """Inject a custom :class:`ILLMProvider` backend."""
        self._llm = provider
        return self

    def with_chunking_strategy(
        self,
        strategy: IChunkingStrategy,
        *,
        alias: str | None = None,
    ) -> ContextForgeBuilder:
        """Register an additional :class:`IChunkingStrategy` extension."""
        self._chunkers.append((strategy, alias))
        return self

    def with_ranking_strategy(
        self,
        strategy: IHybridRankingStrategy,
        *,
        alias: str | None = None,
    ) -> ContextForgeBuilder:
        """Register an additional :class:`IHybridRankingStrategy` extension."""
        self._rankers.append((strategy, alias))
        return self

    def with_exporter(
        self,
        exporter: IBundleExporter,
        *,
        alias: str | None = None,
    ) -> ContextForgeBuilder:
        """Register an additional :class:`IBundleExporter` extension."""
        self._exporters.append((exporter, alias))
        return self

    def with_rule(self, rule: IDocumentRule) -> ContextForgeBuilder:
        """Append an additional :class:`IDocumentRule` to the validation chain."""
        self._rules.append(rule)
        return self

    def with_observer(self, observer: IKnowledgeObserver) -> ContextForgeBuilder:
        """Attach an :class:`IKnowledgeObserver` to the internal event bus."""
        self._observers.append(observer)
        return self

    def build(self) -> ContextForge:
        """Construct and return a fully wired :class:`ContextForge` facade."""
        engine = ContextForge(
            config=self._config,
            lexical_store=self._lexical,
            vector_store=self._vector,
            llm_provider=self._llm,
        )
        for chunker, alias in self._chunkers:
            engine.register_chunking_strategy(chunker, alias=alias)
        for ranker, alias in self._rankers:
            engine.register_ranking_strategy(ranker, alias=alias)
        for exporter, alias in self._exporters:
            engine.register_exporter(exporter, alias=alias)
        for rule in self._rules:
            engine.register_rule(rule)
        for observer in self._observers:
            engine.subscribe(observer)
        return engine
