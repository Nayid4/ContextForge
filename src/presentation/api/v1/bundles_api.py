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

