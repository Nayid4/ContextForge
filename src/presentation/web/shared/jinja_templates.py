"""Shared Jinja2Templates registry and active-project cookie resolver."""

from __future__ import annotations

from pathlib import Path
from fastapi import Request
from fastapi.templating import Jinja2Templates

from infrastructure.di import DependencyContainer

WEB_TEMPLATES_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(WEB_TEMPLATES_DIR))


async def resolve_active_project_slug(request: Request, c: DependencyContainer, explicit_project: str | None = None) -> str:
    if explicit_project and explicit_project.strip():
        return explicit_project.strip()
    cookie_proj = request.cookies.get("cf_active_project", "").strip()
    if cookie_proj:
        found = await c.project_repo.get_by_slug(cookie_proj)
        if found is not None:
            return found.slug
    active = await c.project_repo.get_active()
    return active.slug
