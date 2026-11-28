"""Hybrid Authentication (OAuth2/JWT + SHA-256 API Keys) and RBAC Guards (RF-CFG-003, RNF-01, RNF-02)."""

from __future__ import annotations

import hashlib
import ipaddress
from typing import Any, Callable, Sequence
from fastapi import Depends, Request

from domain.common import DomainError, DomainException
from domain.users import AuthPrincipal, PermissionAction, UserRole
from infrastructure.di import DependencyContainer, get_container


def _is_trusted_proxy(remote_host: str, trusted_proxies: Sequence[str]) -> bool:
    if not remote_host or not trusted_proxies:
        return False
    try:
        remote_ip = ipaddress.ip_address(remote_host.strip())
    except ValueError:
        return False
    for entry in trusted_proxies:
        item = entry.strip()
        if not item:
            continue
        if item == "*":
            return True
        try:
            if "/" in item:
                if remote_ip in ipaddress.ip_network(item, strict=False):
                    return True
            elif remote_ip == ipaddress.ip_address(item):
                return True
        except ValueError:
            continue
    return False


def get_client_ip(request: Request, trusted_proxies: Sequence[str] | None = None) -> str:
    """Resolves real client IP, honoring X-Forwarded-For ONLY when direct peer is in TRUSTED_PROXIES."""
    direct_ip = request.client.host if request.client else "127.0.0.1"
    eff_proxies = trusted_proxies if trusted_proxies is not None else get_container().settings.env.trusted_proxies
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded and _is_trusted_proxy(direct_ip, eff_proxies):
        hops = [h.strip() for h in forwarded.split(",") if h.strip()]
        for hop in reversed(hops):
            if not _is_trusted_proxy(hop, eff_proxies):
                return hop
        if hops:
            return hops[0]
    return direct_ip


_PASSWORD_CHANGE_EXEMPT_PATHS: frozenset[str] = frozenset(
    {
        "/api/v1/auth/me",
        "/api/v1/auth/change-password",
        "/api/v1/auth/logout",
    }
)


async def resolve_principal_from_headers(request: Request, container: DependencyContainer) -> AuthPrincipal:
    auth_header = request.headers.get("Authorization", "").strip()
    api_key_header = request.headers.get("X-API-Key", "").strip()
    cookie_token = (request.cookies.get("cf_access_token") or "").strip()

    if auth_header.lower().startswith("bearer "):
        token = auth_header[7:].strip()
        res = container.jwt_service.verify_access_token(token)
        if res.is_error:
            raise DomainException(res.first_error)
        principal = res.value
        if principal.must_change_password and request.url.path not in _PASSWORD_CHANGE_EXEMPT_PATHS:
            raise DomainException(
                DomainError.forbidden(
                    "password_change_required",
                    "Debes cambiar tu contraseña inicial antes de continuar (/change-password).",
                )
            )
        return principal

    if api_key_header:
        key_hash = hashlib.sha256(api_key_header.encode("utf-8")).hexdigest()
        key_entity = await container.api_key_repo.get_by_hash(key_hash)
        if key_entity is None or not key_entity.is_valid:
            raise DomainException(DomainError.unauthorized("invalid_api_key", "API Key inválida, expirada o revocada."))
        await container.api_key_repo.touch_last_used(key_entity.key_id)
        return AuthPrincipal(
            subject_id=f"apikey:{key_entity.key_id[:8]}",
            display_name=key_entity.name,
            email="",
            role=key_entity.role_scope,
            allowed_projects=key_entity.allowed_projects,
            allowed_agents=key_entity.allowed_agents or ("*",),
            token_scope="widget:chat" if key_entity.is_publishable else "api_key",
            key_id=key_entity.key_id,
            auth_scheme="api_key",
        )

    if cookie_token:
        res = container.jwt_service.verify_access_token(cookie_token)
        if not res.is_error:
            principal = res.value
            if principal.must_change_password and request.url.path not in _PASSWORD_CHANGE_EXEMPT_PATHS:
                raise DomainException(
                    DomainError.forbidden(
                        "password_change_required",
                        "Debes cambiar tu contraseña inicial antes de continuar (/change-password).",
                    )
                )
            return principal

    if container.settings.env.auth_mode == "local":
        return AuthPrincipal(
            subject_id="local-admin",
            display_name="Desarrollador Soberano Local",
            email="admin@contextforge.local",
            role=UserRole.ADMIN,
            allowed_projects=("*",),
            auth_scheme="local_dev",
        )

    raise DomainException(
        DomainError.unauthorized(
            "authentication_required",
            "Autenticación obligatoria (Bearer JWT o X-API-Key) en modo enterprise_rbac (RNF-01).",
        )
    )


async def get_current_user(
    request: Request,
    container: DependencyContainer = Depends(get_container),
) -> AuthPrincipal:
    return await resolve_principal_from_headers(request, container)


def require_permission(action: PermissionAction, project_param: str | None = None) -> Callable[..., Any]:
    async def _guard(
        request: Request,
        principal: AuthPrincipal = Depends(get_current_user),
        container: DependencyContainer = Depends(get_container),
    ) -> AuthPrincipal:
        project_slug: str | None = None
        if project_param:
            project_slug = request.path_params.get(project_param) or request.query_params.get(project_param)

        effective_principal = principal
        if project_slug and principal.role != UserRole.ADMIN and principal.auth_scheme == "jwt":
            member_role_raw = await container.project_repo.get_member_role(project_slug, principal.subject_id)
            if member_role_raw:
                parsed_role = UserRole.parse(member_role_raw)
                if not parsed_role.is_error:
                    effective_principal = AuthPrincipal(
                        subject_id=principal.subject_id,
                        display_name=principal.display_name,
                        email=principal.email,
                        role=parsed_role.value,
                        allowed_projects=principal.allowed_projects,
                        allowed_agents=principal.allowed_agents,
                        token_scope=principal.token_scope,
                        key_id=principal.key_id,
                        auth_scheme=principal.auth_scheme,
                        must_change_password=principal.must_change_password,
                    )

        perm = effective_principal.can_perform(action, project_slug=project_slug)
        if perm.is_error:
            raise DomainException(perm.first_error)
        return effective_principal

    return _guard


def build_cqrs_context(request: Request, principal: AuthPrincipal, project_slug: str = "default") -> dict[str, Any]:
    return {
        "actor_id": principal.subject_id,
        "role": principal.role.value,
        "project_slug": project_slug,
        "client_ip": get_client_ip(request),
        "trace_id": getattr(request.state, "trace_id", "local"),
    }
