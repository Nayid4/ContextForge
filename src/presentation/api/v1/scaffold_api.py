"""Technical Documentation Scaffolding and AI Blueprint REST API."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from core.templates.blueprints import get_all_blueprints
from core.use_cases.scaffold_doc import ScaffoldDocCommand, ScaffoldDocUseCase
from presentation.api.dependencies import get_scaffold_doc_use_case

router = APIRouter(prefix="/docs", tags=["Documentation Scaffolding"])


class BlueprintResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    default_module: str
    default_tags: list[str]


class ScaffoldAiRequest(BaseModel):
    title: str = Field(..., description="Document title")
    context_description: str = Field(..., description="Business or architectural context details for the document")
    template_id: str = Field("adr", description="Template identifier: adr, business_flow, api_integration, troubleshooting")
    project_slug: str = Field("default", description="Target project identifier for isolation")
    module: str | None = Field(None, description="Optional override of documentation module")
    author: str = Field("Equipo Técnico", description="Document author")
    use_ai: bool = Field(True, description="Whether to invoke local LLM or populate blueprint statically")


class ScaffoldDocResponse(BaseModel):
    path: str
    title: str
    module: str
    tags: list[str]
    author: str
    project_slug: str
    content_markdown: str


@router.get("/templates", response_model=list[BlueprintResponse])
async def list_documentation_templates() -> Any:
    """Retrieve catalog of standardized technical documentation blueprints."""
    blueprints = get_all_blueprints()
    return [
        {
            "id": b.id,
            "name": b.name,
            "category": b.category,
            "description": b.description,
            "default_module": b.default_module,
            "default_tags": b.default_tags,
        }
        for b in blueprints
    ]


@router.post("/scaffold-ai", response_model=ScaffoldDocResponse, status_code=status.HTTP_201_CREATED)
async def scaffold_documentation_with_ai(
    payload: ScaffoldAiRequest,
    use_case: ScaffoldDocUseCase = Depends(get_scaffold_doc_use_case),
) -> Any:
    """Generate technical documentation assisted by local Ollama AI and persist in project directory."""
    command = ScaffoldDocCommand(
        project_slug=payload.project_slug,
        template_id=payload.template_id,
        title=payload.title,
        context_description=payload.context_description,
        module=payload.module,
        author=payload.author,
        use_ai=payload.use_ai,
    )
    doc = await use_case.execute(command)
    return {
        "path": doc.path,
        "title": doc.title,
        "module": doc.module,
        "tags": doc.tags,
        "author": doc.author,
        "project_slug": doc.project_slug,
        "content_markdown": doc.content_markdown,
    }

