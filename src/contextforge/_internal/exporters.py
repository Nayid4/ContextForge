"""Built-in Context Bundle exporters and GoF Registry Factory."""

from __future__ import annotations

import json
from typing import Sequence
from xml.sax.saxutils import escape

from contextforge.contracts import IBundleExporter
from contextforge.exceptions import UnknownExportFormatError
from contextforge.models import KnowledgeDocument


class MarkdownBundleExporter(IBundleExporter):
    """Exports Context Bundles as clean Markdown ready for AI agent system prompts."""

    @property
    def format_name(self) -> str:
        return "markdown"

    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        lines = [
            f"# Context Bundle: {name}",
            f"> Documents: {len(documents)} | Estimated Tokens: {estimated_tokens}/{max_tokens}",
            "",
        ]
        for doc in documents:
            lines.append(f"## {doc.title} (`{doc.doc_id}`)")
            if doc.tags:
                lines.append(f"Tags: {', '.join(doc.tags)}")
            lines.append("")
            lines.append(doc.content.strip())
            lines.append("")
        return "\n".join(lines).strip() + "\n"


class JsonBundleExporter(IBundleExporter):
    """Exports Context Bundles as structured JSON for programmatic pipelines."""

    @property
    def format_name(self) -> str:
        return "json"

    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        payload = {
            "bundle_name": name,
            "estimated_tokens": estimated_tokens,
            "max_tokens": max_tokens,
            "document_count": len(documents),
            "documents": [
                {
                    "doc_id": d.doc_id,
                    "title": d.title,
                    "collection": d.collection,
                    "tags": list(d.tags),
                    "content": d.content,
                }
                for d in documents
            ],
        }
        return json.dumps(payload, indent=2, ensure_ascii=False)


class XmlBundleExporter(IBundleExporter):
    """Exports Context Bundles as Anthropic/Claude-friendly XML tags."""

    @property
    def format_name(self) -> str:
        return "xml"

    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        parts = [
            f'<context_bundle name="{escape(name)}" tokens="{estimated_tokens}" max_tokens="{max_tokens}">'
        ]
        for doc in documents:
            parts.append(
                f'  <document id="{escape(doc.doc_id)}" title="{escape(doc.title)}" collection="{escape(doc.collection)}">'
            )
            parts.append(f"    {escape(doc.content.strip())}")
            parts.append("  </document>")
        parts.append("</context_bundle>")
        return "\n".join(parts) + "\n"


class BundleExporterRegistry:
    """GoF Creational Factory managing built-in and third-party :class:`IBundleExporter` instances."""

    def __init__(self) -> None:
        self._exporters: dict[str, IBundleExporter] = {}
        self.register(MarkdownBundleExporter())
        self.register(JsonBundleExporter())
        self.register(XmlBundleExporter())

    def register(self, exporter: IBundleExporter, alias: str | None = None) -> None:
        key = (alias or exporter.format_name).strip().lower()
        self._exporters[key] = exporter

    def get(self, format_name: str) -> IBundleExporter:
        key = format_name.strip().lower()
        exporter = self._exporters.get(key)
        if exporter is None:
            raise UnknownExportFormatError(format_name, available=list(self._exporters.keys()))
        return exporter

    @property
    def available_formats(self) -> tuple[str, ...]:
        return tuple(sorted(self._exporters.keys()))
