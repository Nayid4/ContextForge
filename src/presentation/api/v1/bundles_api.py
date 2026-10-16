"""Context Bundles REST API Endpoints."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from domain.shared_kernel.exceptions import EntityNotFoundException
from application.context_builder.commands import BuildContextBundleCommand
from application.context_builder.handlers import BuildContextBundleCommandHandler
from presentation.api.dependencies import get_bundle_handler, get_bundle_repo

router = APIRouter(prefix="/bundles", tags=["Context Bundles"])


class ExportBundleRequest(BaseModel):
    modules: list[str] = Field(default_factory=list)
    max_tokens: int = 16000
    include_toc: bool = True
    include_guidelines: bool = True


class BundleResponse(BaseModel):
    id: str
    title: str
    modules: list[str]
    token_count: int
    file_path: str


@router.post("/export", response_model=BundleResponse)
async def export_context_bundle(
    payload: ExportBundleRequest,
    handler: BuildContextBundleCommandHandler = Depends(get_bundle_handler),
) -> Any:
    """Compile and export a context bundle for Cursor, Copilot, or Windsurf."""
    command = BuildContextBundleCommand(
        modules=payload.modules,
        max_tokens=payload.max_tokens,
        include_toc=payload.include_toc,
        include_guidelines=payload.include_guidelines,
    )
    bundle = await handler.handle(command)
    return {
        "id": bundle.id,
        "title": bundle.title,
        "modules": bundle.modules,
        "token_count": bundle.token_count,
        "file_path": bundle.file_path,
    }


@router.get("/{bundle_id}/download")
async def download_bundle(
    bundle_id: str,
    repo: Any = Depends(get_bundle_repo),
) -> FileResponse:
    """Download compiled context bundle as .md attachment."""
    bundle = await repo.get_bundle(bundle_id)
    if not bundle or not Path(bundle.file_path).exists():
        raise EntityNotFoundException(f"Bundle {bundle_id} no encontrado")

    filename = Path(bundle.file_path).name
    return FileResponse(
        path=bundle.file_path,
        media_type="text/markdown",
        filename=filename,
    )


class ExportAgentRulesRequest(BaseModel):
    project_slug: str = Field(default="default")
    targets: list[str] = Field(default_factory=lambda: ["CLAUDE.md", ".cursorrules", "AGENTS.md"])
    selected_modules: list[str] = Field(default_factory=list)
    write_to_project_root: bool = Field(default=True)


@router.post("/export-agent-rules")
async def export_agent_rules_endpoint(
    payload: ExportAgentRulesRequest,
) -> dict[str, Any]:
    """Generate and optionally write CLAUDE.md, .cursorrules, and AGENTS.md for local CLI agents."""
    from application.context_bridge.commands.export_agent_rules import (
        ExportAgentRulesCommand,
        ExportAgentRulesCommandHandler,
    )
    from presentation.api.dependencies import get_doc_repo

    doc_repo = get_doc_repo()
    out_dir = "." if payload.write_to_project_root else "./bundles"
    handler = ExportAgentRulesCommandHandler(doc_repo=doc_repo, output_dir=out_dir)

    target_map = {
        "CLAUDE.md": "claude_md",
        "claude_md": "claude_md",
        ".cursorrules": "cursorrules",
        "cursorrules": "cursorrules",
        "AGENTS.md": "agents_md",
        "agents_md": "agents_md",
    }

    generated_files: list[dict[str, Any]] = []
    docs_count = 0
    for raw_target in payload.targets:
        mapped = target_map.get(raw_target, "claude_md")
        res = await handler.handle(
            ExportAgentRulesCommand(
                project_slug=payload.project_slug,
                agent_target=mapped,
                modules=payload.selected_modules,
            )
        )
        docs_count = res.documents_included
        generated_files.append(
            {
                "filename": res.filename,
                "target": mapped,
                "token_estimate": res.token_estimate,
                "written_path": res.file_path,
                "content": res.content,
            }
        )

    return {
        "project_slug": payload.project_slug,
        "total_documents_included": docs_count,
        "files": generated_files,
    }


