"""Internal RAG Q&A and Context Bundle compilation pipelines delegated by ContextForge Facade."""

from __future__ import annotations

import time
from typing import Callable, Sequence
import uuid

from contextforge._internal.exporters import BundleExporterRegistry
from contextforge._internal.stores import estimate_tokens
from contextforge.contracts import ILLMProvider
from contextforge.exceptions import ProviderUnavailableError
from contextforge.models import (
    ContextBundle,
    KnowledgeDocument,
    RagResponse,
    SearchHit,
    SourceCitation,
)


def execute_rag_pipeline(
    *,
    question: str,
    hits: Sequence[SearchHit],
    llm_provider: ILLMProvider,
    retrieval_mode: str,
    ranking_strategy: str,
    system_prompt: str | None = None,
) -> RagResponse:
    """Assemble grounded context prompt, invoke ILLMProvider, and attach SourceCitations."""
    started = time.perf_counter()
    citations = tuple(
        SourceCitation(
            doc_id=h.doc_id,
            title=h.title,
            chunk_id=h.chunk_id,
            score=h.score,
            excerpt=h.text[:220],
            headers=h.headers,
        )
        for h in hits
    )
    context_block = "\n".join(
        f"[{idx}] ({c.doc_id} - {c.title}): {c.excerpt}"
        for idx, c in enumerate(citations, start=1)
    )
    prompt = (
        f"Context:\n{context_block}\n\nQuestion: {question}"
        if context_block
        else f"Question: {question}"
    )
    sys_msg = system_prompt or (
        "Answer strictly using the provided knowledge context and cite source numbers like [1]."
    )

    try:
        answer = llm_provider.generate(prompt, system_prompt=sys_msg)
    except Exception as exc:
        raise ProviderUnavailableError(llm_provider.provider_name, str(exc)) from exc

    elapsed = round((time.perf_counter() - started) * 1000.0, 2)
    return RagResponse(
        question=question,
        answer=answer,
        citations=citations,
        provider_name=llm_provider.provider_name,
        retrieval_mode=retrieval_mode,
        ranking_strategy=ranking_strategy,
        grounded=len(citations) > 0,
        latency_ms=elapsed,
    )


def execute_bundle_pipeline(
    *,
    name: str,
    documents_by_id: dict[str, KnowledgeDocument],
    exporters: BundleExporterRegistry,
    export_format: str,
    max_tokens: int,
    query: str | None,
    document_ids: Sequence[str] | None,
    search_fn: Callable[[str, int], list[SearchHit]],
) -> ContextBundle:
    """Select documents within token budget and serialize via registered IBundleExporter."""
    exporter = exporters.get(export_format)

    ordered_docs: list[KnowledgeDocument] = []
    if document_ids is not None:
        for did in document_ids:
            if did in documents_by_id:
                ordered_docs.append(documents_by_id[did])
    elif query and query.strip():
        hits = search_fn(query, max(5, len(documents_by_id)))
        seen: set[str] = set()
        for hit in hits:
            if hit.doc_id not in seen and hit.doc_id in documents_by_id:
                seen.add(hit.doc_id)
                ordered_docs.append(documents_by_id[hit.doc_id])
    else:
        ordered_docs = list(documents_by_id.values())

    included: list[KnowledgeDocument] = []
    omitted: list[str] = []
    used_tokens = 0
    for doc in ordered_docs:
        doc_tokens = estimate_tokens(f"{doc.title}\n{doc.content}")
        if used_tokens + doc_tokens <= max_tokens:
            included.append(doc)
            used_tokens += doc_tokens
        else:
            omitted.append(doc.doc_id)

    serialized = exporter.export(
        name=name,
        documents=included,
        estimated_tokens=used_tokens,
        max_tokens=max_tokens,
    )
    return ContextBundle(
        bundle_id=f"bnd-{uuid.uuid4().hex[:10]}",
        name=name,
        export_format=exporter.format_name,
        content=serialized,
        included_doc_ids=tuple(d.doc_id for d in included),
        omitted_doc_ids=tuple(omitted),
        estimated_tokens=used_tokens,
        max_tokens=max_tokens,
    )
