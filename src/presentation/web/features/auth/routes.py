"""Team Mode Authentication Web Routes (/login and /change-password) (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse

from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import templates

router = APIRouter(tags=["Web: Auth"])


@router.get("/login", response_class=HTMLResponse)
async def login_page(
    request: Request,
    next_url: str = Query("/docs/browser", alias="next"),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    safe_next = next_url if next_url.startswith("/") and not next_url.startswith("//") else "/docs/browser"
    return templates.TemplateResponse(
        request=request,
        name="features/auth/views/login.html",
        context={
            "auth_mode": c.settings.env.auth_mode,
            "next_url": safe_next,
        },
    )


@router.get("/change-password", response_class=HTMLResponse)
async def change_password_page(
    request: Request,
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    return templates.TemplateResponse(
        request=request,
        name="features/auth/views/change_password.html",
        context={"auth_mode": c.settings.env.auth_mode},
    )
