"""Auth & RBAC REST v1 Router with real DB pagination for API keys (0 classes)."""

from __future__ import annotations

from typing import Any
import uuid
from fastapi import APIRouter, Depends, Query, Request, Response

from application.users.commands.AuthenticateUser import AuthenticateUserCommand
from application.users.commands.IssueApiKey import IssueApiKeyCommand
from application.users.commands.RevokeApiKey import RevokeApiKeyCommand
from domain.common import DomainError, DomainException, PageParams
from domain.users import AuthPrincipal, PermissionAction, UserEntity, UserRole
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import build_cqrs_context, get_client_ip, get_current_user, require_permission
from presentation.api.v1.schemas import ApiKeyPayload, LoginPayload
from presentation.api.v1.schemas.change_password_payload import ChangePasswordPayload
from presentation.api.v1.schemas.create_user_payload import CreateUserPayload

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/login")
async def login(
    payload: LoginPayload,
    request: Request,
    response: Response,
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    res: dict[str, Any] = await c.mediator.execute_or_raise(
        AuthenticateUserCommand(email=payload.email, password=payload.password),
        context={"actor_id": payload.email, "role": "Anonymous", "client_ip": get_client_ip(request)},
    )
    response.set_cookie(
        key="cf_access_token",
        value=str(res["access_token"]),
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        max_age=int(res.get("expires_in", 900)),
        path="/",
    )
    return res


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    principal: AuthPrincipal = Depends(get_current_user),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    response.delete_cookie("cf_access_token", path="/")
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug="workspace",
        operation="auth.logout",
        resource_id=principal.subject_id,
        succeeded=True,
        latency_ms=0.0,
        client_ip=get_client_ip(request),
    )
    return {"logged_out": True}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordPayload,
    request: Request,
    response: Response,
    principal: AuthPrincipal = Depends(get_current_user),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    user = await c.user_repo.get_by_id(principal.subject_id)
    if user is None and principal.email:
        user = await c.user_repo.get_by_email(principal.email)
    if user is None:
        raise DomainException(DomainError.not_found("user_not_found", "Usuario no encontrado."))
    if not c.password_hasher.verify_password(payload.current_password, user.password_hash):
        raise DomainException(DomainError.unauthorized("invalid_current_password", "La contraseña actual es incorrecta."))
    if payload.new_password == payload.current_password:
        raise DomainException(
            DomainError.validation("same_password", "La nueva contraseña debe ser diferente a la contraseña actual.")
        )
    updated = UserEntity(
        user_id=user.user_id,
        email=user.email,
        full_name=user.full_name,
        password_hash=c.password_hasher.hash_password(payload.new_password),
        role=user.role,
        is_active=user.is_active,
        must_change_password=False,
        created_at=user.created_at,
    )
    await c.user_repo.save_user(updated)
    tokens = c.jwt_service.issue_token_pair(updated)
    response.set_cookie(
        key="cf_access_token",
        value=str(tokens["access_token"]),
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        max_age=int(tokens.get("expires_in", 900)),
        path="/",
    )
    await c.event_store.append_audit(
        actor_id=updated.user_id,
        role=updated.role.value,
        project_slug="workspace",
        operation="auth.change_password",
        resource_id=updated.user_id,
        succeeded=True,
        latency_ms=0.0,
        client_ip=get_client_ip(request),
    )
    return {"changed": True, **tokens}


@router.get("/users")
async def list_team_users(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_PROJECT_MEMBERS)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    users = await c.user_repo.list_users()
    return {
        "items": [
            {
                "user_id": u.user_id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role.value,
                "is_active": u.is_active,
                "must_change_password": u.must_change_password,
            }
            for u in users
        ]
    }


@router.post("/users", status_code=201)
async def create_team_user(
    payload: CreateUserPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    norm_email = payload.email.strip().lower()
    if "@" not in norm_email or "." not in norm_email.split("@")[-1]:
        raise DomainException(DomainError.validation("invalid_email", "Correo electrónico no válido."))
    existing = await c.user_repo.get_by_email(norm_email)
    if existing is not None:
        raise DomainException(DomainError.conflict("email_exists", f"Ya existe un usuario con correo '{norm_email}'."))
    role_res = UserRole.parse(payload.role)
    if role_res.is_error:
        raise DomainException(role_res.first_error)
    ent = UserEntity(
        user_id=f"usr-{uuid.uuid4().hex[:12]}",
        email=norm_email,
        full_name=payload.full_name.strip(),
        password_hash=c.password_hasher.hash_password(payload.password),
        role=role_res.value,
        is_active=True,
        must_change_password=bool(payload.must_change_password),
    )
    saved = await c.user_repo.save_user(ent)
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug="workspace",
        operation="auth.create_user",
        resource_id=saved.user_id,
        succeeded=True,
        latency_ms=0.0,
        client_ip=get_client_ip(request),
    )
    return {
        "user_id": saved.user_id,
        "email": saved.email,
        "full_name": saved.full_name,
        "role": saved.role.value,
        "must_change_password": saved.must_change_password,
    }


@router.get("/me")
async def me(principal: AuthPrincipal = Depends(get_current_user), c: DependencyContainer = Depends(get_container)) -> dict[str, Any]:
    return {
        "subject_id": principal.subject_id,
        "display_name": principal.display_name,
        "email": principal.email,
        "role": principal.role.value,
        "allowed_projects": list(principal.allowed_projects),
        "auth_scheme": principal.auth_scheme,
        "auth_mode": c.settings.env.auth_mode,
        "must_change_password": principal.must_change_password,
        "strict_bind_check": c.settings.env.strict_bind_check,
    }


@router.get("/api-keys")
async def list_api_keys(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.api_key_repo.list_paginated(pagination=PageParams(page=page, page_size=page_size))
    return {
        "items": [
            {
                "key_id": k.key_id,
                "name": k.name,
                "key_prefix": k.key_prefix,
                "role_scope": k.role_scope.value,
                "allowed_projects": list(k.allowed_projects),
                "is_publishable": k.is_publishable,
                "allowed_origins": list(k.allowed_origins),
                "allowed_agents": list(k.allowed_agents),
                "daily_quota_requests": k.daily_quota_requests,
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "is_valid": k.is_valid,
                "revoked_at": k.revoked_at.isoformat() if k.revoked_at else None,
                "created_at": k.created_at.isoformat(),
            }
            for k in paged.items
        ],
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


@router.post("/api-keys", status_code=201)
async def create_api_key(
    payload: ApiKeyPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    created: dict[str, Any] = await c.mediator.execute_or_raise(
        IssueApiKeyCommand(
            user_id=principal.subject_id,
            name=payload.name,
            role_scope=payload.role_scope,
            allowed_projects=tuple(payload.allowed_projects),
            is_publishable=payload.is_publishable,
            allowed_origins=tuple(payload.allowed_origins),
            allowed_agents=tuple(payload.allowed_agents),
            daily_quota_requests=payload.daily_quota_requests,
        ),
        context=build_cqrs_context(request, principal),
    )
    return created


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_INFRA_AND_SECURITY)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    await c.mediator.execute_or_raise(RevokeApiKeyCommand(key_id=key_id), context=build_cqrs_context(request, principal))
    return {"revoked": True, "key_id": key_id}
