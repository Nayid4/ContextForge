from __future__ import annotations
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class EnvironmentOptions:
    app_name: str = "ContextForge"
    app_version: str = "2.0.0"
    app_env: str = "local"  # local | qa | prod
    auth_mode: str = "local"  # local | enterprise_rbac
    jwt_secret_key: str = "contextforge-dev-secret-key-256bit-minimum-length-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    master_vault_key: str = "contextforge-master-vault-key-32b!"
    cors_allowed_origins: tuple[str, ...] = ("*",)
    auto_seed_data: bool = True
    rate_limit_read_per_minute: int = 120
    rate_limit_ai_per_minute: int = 30
    trusted_proxies: tuple[str, ...] = ()
    strict_bind_check: bool = True

    @classmethod
    def from_env(cls) -> EnvironmentOptions:
        origins_raw = os.getenv("CORS_ALLOWED_ORIGINS", "*")
        origins = tuple(o.strip() for o in origins_raw.split(",") if o.strip()) or ("*",)
        proxies_raw = os.getenv("TRUSTED_PROXIES", "")
        trusted_proxies = tuple(p.strip() for p in proxies_raw.split(",") if p.strip())
        return cls(
            app_name=os.getenv("APP_NAME", "ContextForge"),
            app_version=os.getenv("APP_VERSION", "2.0.0"),
            app_env=os.getenv("APP_ENV", "local").lower(),
            auth_mode=os.getenv("AUTH_MODE", "local").lower(),
            jwt_secret_key=os.getenv("JWT_SECRET_KEY", "contextforge-dev-secret-key-256bit-minimum-length-2026"),
            jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
            access_token_expire_minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15")),
            refresh_token_expire_days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7")),
            master_vault_key=os.getenv("MASTER_VAULT_KEY", "contextforge-master-vault-key-32b!"),
            cors_allowed_origins=origins,
            auto_seed_data=os.getenv("AUTO_SEED_DATA", "true").lower() in ("1", "true", "yes"),
            rate_limit_read_per_minute=int(os.getenv("RATE_LIMIT_READ_PER_MINUTE", "120")),
            rate_limit_ai_per_minute=int(os.getenv("RATE_LIMIT_AI_PER_MINUTE", "30")),
            trusted_proxies=trusted_proxies,
            strict_bind_check=os.getenv("CONTEXTFORGE_STRICT_BIND_CHECK", "true").lower() not in ("0", "false", "no"),
        )
