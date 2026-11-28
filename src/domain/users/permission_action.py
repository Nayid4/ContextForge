"""RBAC permission actions and role-permission matrix."""

from __future__ import annotations

from enum import Enum

from domain.users.user_role import UserRole


class PermissionAction(str, Enum):
    READ_KNOWLEDGE = "read_knowledge"
    SEARCH_AND_ASK = "search_and_ask"
    COMPILE_BUNDLE = "compile_bundle"
    COLLABORATE = "collaborate"
    WRITE_DOCUMENT = "write_document"
    PUBLISH_EDITORIAL = "publish_editorial"
    MANAGE_PROJECTS = "manage_projects"
    MANAGE_PROJECT_MEMBERS = "manage_project_members"
    MANAGE_INFRA_AND_SECURITY = "manage_infra_and_security"
    READ_AUDIT_LOGS = "read_audit_logs"


ROLE_PERMISSIONS: dict[UserRole, frozenset[PermissionAction]] = {
    UserRole.ADMIN: frozenset(PermissionAction),
    UserRole.OWNER: frozenset(
        {
            PermissionAction.READ_KNOWLEDGE,
            PermissionAction.SEARCH_AND_ASK,
            PermissionAction.COMPILE_BUNDLE,
            PermissionAction.COLLABORATE,
            PermissionAction.WRITE_DOCUMENT,
            PermissionAction.PUBLISH_EDITORIAL,
            PermissionAction.MANAGE_PROJECTS,
            PermissionAction.MANAGE_PROJECT_MEMBERS,
        }
    ),
    UserRole.CURATOR: frozenset(
        {
            PermissionAction.READ_KNOWLEDGE,
            PermissionAction.SEARCH_AND_ASK,
            PermissionAction.COMPILE_BUNDLE,
            PermissionAction.COLLABORATE,
            PermissionAction.WRITE_DOCUMENT,
            PermissionAction.PUBLISH_EDITORIAL,
            PermissionAction.MANAGE_PROJECTS,
        }
    ),
    UserRole.CONSUMER: frozenset(
        {
            PermissionAction.READ_KNOWLEDGE,
            PermissionAction.SEARCH_AND_ASK,
            PermissionAction.COMPILE_BUNDLE,
            PermissionAction.COLLABORATE,
        }
    ),
    UserRole.AGENT_CLIENT: frozenset(
        {
            PermissionAction.READ_KNOWLEDGE,
            PermissionAction.SEARCH_AND_ASK,
            PermissionAction.COMPILE_BUNDLE,
        }
    ),
}
