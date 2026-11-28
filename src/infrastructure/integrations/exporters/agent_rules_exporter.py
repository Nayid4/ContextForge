"""Generates CLAUDE.md, .cursorrules, and AGENTS.md rule files from published project docs."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Sequence

from domain.bundles import estimate_token_count
from domain.documents import DocumentAggregate


class AgentRulesExporter:
    ALLOWED_TARGETS: frozenset[str] = frozenset({"CLAUDE.md", ".cursorrules", "AGENTS.md"})

    @classmethod
    def export(
        cls,
        *,
        project_slug: str,
        docs: Sequence[DocumentAggregate],
        targets: Sequence[str],
        output_root: Path | None = None,
        write_to_disk: bool = False,
    ) -> list[dict[str, Any]]:
        valid_targets = [t for t in targets if t in cls.ALLOWED_TARGETS]
        if not valid_targets:
            valid_targets = ["CLAUDE.md", ".cursorrules", "AGENTS.md"]

        sections = [
            f"# ContextForge Agent Rules ({project_slug})",
            "> Generado automáticamente desde la documentación certificada de ContextForge.",
            "",
            "## Reglas y Especificaciones Activas",
        ]
        for d in docs:
            sections.append(f"### [{d.path}] {d.title} (v{d.current_version})")
            sections.append(d.content_markdown.strip())
            sections.append("")
        compiled = "\n".join(sections).strip() + "\n"
        tok_est = estimate_token_count(compiled)

        results: list[dict[str, Any]] = []
        root = (output_root or Path("./data/storage/agent_rules")).resolve()
        for filename in valid_targets:
            written_path = ""
            if write_to_disk:
                dest = (root / project_slug / filename).resolve()
                if dest.is_relative_to(root):
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_text(compiled, encoding="utf-8")
                    written_path = dest.as_posix()
            results.append(
                {
                    "filename": filename,
                    "token_estimate": tok_est,
                    "document_count": len(docs),
                    "written_path": written_path,
                    "content": compiled,
                }
            )
        return results
