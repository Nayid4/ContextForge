from __future__ import annotations
import hashlib
import secrets
import uuid
from application.users.commands.IssueApiKey.IssueApiKeyCommand import IssueApiKeyCommand
from domain.common import ErrorOr
from domain.users import ApiKeyEntity, IApiKeyRepositoryPort, UserRole


class IssueApiKeyCommandHandler:
    def __init__(self, key_repo: IApiKeyRepositoryPort) -> None:
        self._repo = key_repo

    async def handle(self, request: IssueApiKeyCommand) -> ErrorOr[dict[str, object]]:
        # Publishable keys (for browser widgets) are ALWAYS strictly read-only AgentClient (BR-18)
        prefix = "cf_pub_" if request.is_publishable else "cf_live_"
        raw_token = f"{prefix}{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        role = UserRole.AGENT_CLIENT if request.is_publishable else UserRole.parse(request.role_scope).value
        origins = tuple(o.strip().rstrip("/") for o in request.allowed_origins if o.strip())
        agents = tuple(a.strip() for a in request.allowed_agents if a.strip())
        entity = ApiKeyEntity(
            key_id=str(uuid.uuid4()),
            user_id=request.user_id,
            name=request.name.strip(),
            key_prefix=raw_token[:14],
            key_sha256=key_hash,
            role_scope=role,
            allowed_projects=request.allowed_projects or ("default",),
            is_publishable=request.is_publishable,
            allowed_origins=origins,
            allowed_agents=agents,
            daily_quota_requests=max(10, min(100000, int(request.daily_quota_requests))),
            expires_at=request.expires_at,
        )
        await self._repo.save_key(entity)
        return ErrorOr.ok(
            {
                "key_id": entity.key_id,
                "name": entity.name,
                "api_key": raw_token,
                "key_prefix": entity.key_prefix,
                "role_scope": entity.role_scope.value,
                "allowed_projects": list(entity.allowed_projects),
                "is_publishable": entity.is_publishable,
                "allowed_origins": list(entity.allowed_origins),
                "allowed_agents": list(entity.allowed_agents),
                "daily_quota_requests": entity.daily_quota_requests,
            }
        )
