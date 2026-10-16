"""Handler for ExportAgentRulesCommand."""

from __future__ import annotations

from pathlib import Path
from application.context_bridge.commands.export_agent_rules.command import ExportAgentRulesCommand
from application.context_bridge.commands.export_agent_rules.response import ExportAgentRulesResponse
from application.context_bridge.commands.export_agent_rules.validator import ExportAgentRulesValidator
from application.context_builder.services.bundle_compiler import BundleCompiler
from domain.context_builder.entities import BundleSpecification
from domain.knowledge_docs.repositories import IDocumentRepository


class ExportAgentRulesCommandHandler:
    """Compiles project specifications into CLAUDE.md, .cursorrules, or AGENTS.md."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        compiler: BundleCompiler | None = None,
        output_dir: str = "./bundles",
    ) -> None:
        self._doc_repo = doc_repo
        self._compiler = compiler or BundleCompiler()
        self._output_dir = Path(output_dir)

    async def handle(self, command: ExportAgentRulesCommand) -> ExportAgentRulesResponse:
        ExportAgentRulesValidator.validate(command)
        docs = await self._doc_repo.list_all(project_slug=command.project_slug)
        if command.modules:
            selected_mods = {m.lower() for m in command.modules}
            docs = [d for d in docs if d.module.lower() in selected_mods]

        all_mods = sorted({d.module for d in docs}) if not command.modules else command.modules
        export_fmt = "cursorrules" if command.agent_target in ("cursorrules", "claude_md", "agents_md") else "markdown"

        spec = BundleSpecification(
            modules=all_mods,
            max_tokens=command.max_tokens,
            include_toc=True,
            include_guidelines=True,
            project_slug=command.project_slug,
            export_format=export_fmt,
        )
        bundle = self._compiler.compile(spec=spec, documents=docs)

        filename_map = {
            "claude_md": "CLAUDE.md",
            "cursorrules": ".cursorrules",
            "agents_md": "AGENTS.md",
            "markdown": f"context_{command.project_slug}.md",
        }
        filename = filename_map.get(command.agent_target, "CLAUDE.md")

        header_banner = ""
        if command.agent_target == "claude_md":
            header_banner = (
                f"# CLAUDE.md — ContextForge Official Project Rules [{command.project_slug}]\n"
                "> Auto-generado por ContextForge para Claude Code CLI & Claude Desktop.\n\n"
            )
        elif command.agent_target == "agents_md":
            header_banner = (
                f"# AGENTS.md — ContextForge Official Engineering Rules [{command.project_slug}]\n"
                "> Auto-generado por ContextForge para Antigravity, OpenAI Codex CLI & Open Code.\n\n"
            )

        final_content = header_banner + bundle.compiled_markdown
        self._output_dir.mkdir(parents=True, exist_ok=True)
        out_path = self._output_dir / filename
        out_path.write_text(final_content, encoding="utf-8")

        return ExportAgentRulesResponse(
            filename=filename,
            file_path=out_path.as_posix(),
            content=final_content,
            token_estimate=bundle.token_count,
            documents_included=len(docs),
        )

