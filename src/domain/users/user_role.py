"""Canonical RBAC roles specified in ERS RF-CFG-003."""

from __future__ import annotations

from enum import Enum

from domain.common import DomainError, ErrorOr


class UserRole(str, Enum):
    ADMIN = "Admin"
    OWNER = "Owner"
    CURATOR = "Curator"
    CONSUMER = "Consumer"
    AGENT_CLIENT = "AgentClient"

    @classmethod
    def parse(cls, raw: str) -> ErrorOr[UserRole]:
        norm = raw.strip().lower()
        mapping = {
            "admin": cls.ADMIN,
            "owner": cls.OWNER,
            "curator": cls.CURATOR,
            "consumer": cls.CONSUMER,
            "agentclient": cls.AGENT_CLIENT,
            "agent_client": cls.AGENT_CLIENT,
        }
        if norm in mapping:
            return ErrorOr.ok(mapping[norm])
        return ErrorOr.fail(DomainError.validation("invalid_role", f"Rol RBAC no válido: '{raw}'."))
