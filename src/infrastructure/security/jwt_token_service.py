"""HS256 JWT issuer & verifier with access/refresh rotation (RNF-01, RF-CFG-003)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
import uuid
import jwt

from domain.common import DomainError, ErrorOr
from domain.users import AuthPrincipal, UserEntity, UserRole


class JwtTokenService:
    def __init__(self, secret_key: str, algorithm: str = "HS256", access_minutes: int = 15, refresh_days: int = 7) -> None:
        self._secret = secret_key
        self._algo = algorithm
        self._access_min = access_minutes
        self._refresh_days = refresh_days

    def issue_token_pair(self, user: UserEntity) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        access_payload = {
            "sub": user.user_id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role.value,
            "projects": ["*"],
            "must_change_password": bool(user.must_change_password),
            "type": "access",
            "jti": str(uuid.uuid4()),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=self._access_min)).timestamp()),
        }
        refresh_payload = {
            "sub": user.user_id,
            "type": "refresh",
            "jti": str(uuid.uuid4()),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=self._refresh_days)).timestamp()),
        }
        return {
            "access_token": jwt.encode(access_payload, self._secret, algorithm=self._algo),
            "refresh_token": jwt.encode(refresh_payload, self._secret, algorithm=self._algo),
            "token_type": "bearer",
            "expires_in": self._access_min * 60,
            "must_change_password": bool(user.must_change_password),
            "user": {
                "user_id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "must_change_password": bool(user.must_change_password),
            },
        }

    def issue_ephemeral_widget_token(
        self,
        key_id: str,
        project_slug: str,
        agent_slug: str = "assistant",
        ttl_minutes: int = 15,
    ) -> dict[str, Any]:
        """Issues a short-lived, single-project, single-agent, read-only AgentClient JWT for browser widgets (BR-18)."""
        now = datetime.now(timezone.utc)
        access_payload = {
            "sub": f"widget:{key_id}",
            "email": f"widget@{project_slug}.local",
            "name": f"Widget ({project_slug}/{agent_slug})",
            "role": UserRole.AGENT_CLIENT.value,
            "project": project_slug,
            "agent": agent_slug,
            "projects": [project_slug],
            "agents": [f"{project_slug}/{agent_slug}"],
            "scope": "widget:chat",
            "key_id": key_id,
            "type": "access",
            "jti": str(uuid.uuid4()),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=ttl_minutes)).timestamp()),
        }
        return {
            "access_token": jwt.encode(access_payload, self._secret, algorithm=self._algo),
            "token_type": "bearer",
            "expires_in": ttl_minutes * 60,
            "scope": "widget:chat",
            "project": project_slug,
            "agent": agent_slug,
        }

    def verify_access_token(self, token: str) -> ErrorOr[AuthPrincipal]:
        try:
            payload = jwt.decode(token, self._secret, algorithms=[self._algo])
            if payload.get("type") != "access":
                return ErrorOr.fail(DomainError.unauthorized("invalid_token_type", "Se requiere un access token válido."))
            role_res = UserRole.parse(str(payload.get("role", "Consumer")))
            if role_res.is_error:
                return ErrorOr.fail(*role_res.errors)
            projects_claim = tuple(payload.get("projects") or ([payload["project"]] if payload.get("project") else ["*"]))
            agents_claim = tuple(payload.get("agents") or ([f"{projects_claim[0]}/{payload['agent']}"] if payload.get("agent") else ["*"]))
            return ErrorOr.ok(
                AuthPrincipal(
                    subject_id=str(payload["sub"]),
                    display_name=str(payload.get("name") or payload.get("email") or "User"),
                    email=str(payload.get("email", "")),
                    role=role_res.value,
                    allowed_projects=projects_claim,
                    allowed_agents=agents_claim,
                    token_scope=str(payload.get("scope") or "full"),
                    key_id=str(payload.get("key_id") or ""),
                    auth_scheme="jwt",
                    must_change_password=bool(payload.get("must_change_password", False)),
                )
            )
        except jwt.ExpiredSignatureError:
            return ErrorOr.fail(DomainError.unauthorized("token_expired", "El token JWT ha expirado."))
        except Exception:
            return ErrorOr.fail(DomainError.unauthorized("invalid_jwt", "Firma o estructura JWT inválida."))
