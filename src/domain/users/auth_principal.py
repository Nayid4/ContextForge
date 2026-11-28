"""Authenticated human user, API key or widget JWT principal injected into use cases."""

from __future__ import annotations

from dataclasses import dataclass

from domain.common import DomainError, ErrorOr
from domain.users.permission_action import ROLE_PERMISSIONS, PermissionAction
from domain.users.user_role import UserRole


@dataclass(frozen=True)
class AuthPrincipal:
    subject_id: str
    display_name: str
    email: str
    role: UserRole
    allowed_projects: tuple[str, ...] = ("*",)
    allowed_agents: tuple[str, ...] = ("*",)
    token_scope: str = "full"
    key_id: str = ""
    auth_scheme: str = "local"
    must_change_password: bool = False

    @property
    def can_inspect_internals(self) -> bool:
        """Only Curator, Owner and Admin may view agent system_prompt, topic_boundaries and raw retrieved_chunks."""
        return self.role in (UserRole.ADMIN, UserRole.OWNER, UserRole.CURATOR) and self.token_scope != "widget:chat"

    def can_perform(self, action: PermissionAction, project_slug: str | None = None) -> ErrorOr[bool]:
        allowed_actions = ROLE_PERMISSIONS.get(self.role, frozenset())
        if action not in allowed_actions:
            return ErrorOr.fail(
                DomainError.forbidden(
                    "insufficient_role_permissions",
                    f"El rol '{self.role.value}' no posee permiso para ejecutar '{action.value}' (RF-CFG-003).",
                    required_permission=action.value,
                    role=self.role.value,
                )
            )
        if project_slug and "*" not in self.allowed_projects and project_slug not in self.allowed_projects:
            return ErrorOr.fail(
                DomainError.forbidden(
                    "project_scope_denied",
                    f"La credencial actual no está autorizada sobre el proyecto '{project_slug}' (BR-10, RF-CFG-003).",
                    project_slug=project_slug,
                )
            )
        return ErrorOr.ok(True)

    def can_invoke_agent(self, project_slug: str, agent_slug: str, agent_visibility: str) -> ErrorOr[bool]:
        """Enforces agent visibility (private/internal/public) and explicit agent claim/key allowlist (BR-18, BR-19)."""
        if "*" not in self.allowed_projects and project_slug not in self.allowed_projects:
            return ErrorOr.fail(
                DomainError.forbidden("project_scope_denied", f"Proyecto '{project_slug}' fuera del alcance de la credencial.")
            )
        full_id = f"{project_slug}/{agent_slug}".lower()
        if "*" not in self.allowed_agents and f"{project_slug.lower()}/*" not in {a.lower() for a in self.allowed_agents}:
            allowed_low = {a.strip().lower() for a in self.allowed_agents}
            if full_id not in allowed_low and agent_slug.lower() not in allowed_low:
                return ErrorOr.fail(
                    DomainError.forbidden(
                        "agent_scope_denied",
                        f"Esta credencial/sesión no está autorizada para invocar al agente '{project_slug}/{agent_slug}' (BR-18).",
                    )
                )
        vis = (agent_visibility or "internal").lower()
        if self.token_scope == "widget:chat" and vis != "public":
            return ErrorOr.fail(
                DomainError.forbidden(
                    "agent_not_public",
                    f"El agente '{project_slug}/{agent_slug}' tiene visibilidad '{vis}'; los widgets públicos solo pueden invocar agentes con visibility='public' (BR-18).",
                )
            )
        if vis == "private" and not self.can_inspect_internals:
            return ErrorOr.fail(
                DomainError.forbidden(
                    "agent_private_denied",
                    f"El agente '{project_slug}/{agent_slug}' es privado y solo puede ser invocado por Curator o Admin.",
                )
            )
        return ErrorOr.ok(True)
