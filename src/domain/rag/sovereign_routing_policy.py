"""Egress-based sovereignty & DLP routing policy (BR-13, BR-21): classifies engines by actual data egress (local vs cloud)."""

from __future__ import annotations

from domain.common import DomainError, ErrorOr


class SovereignRoutingPolicy:
    """Classifies LLM providers by real egress destination ('local' vs 'cloud'), never trusting 'local_cli' as local."""

    CLOUD_CLI_IDENTIFIERS: frozenset[str] = frozenset(
        {
            "antigravity_cli",
            "agy",
            "claude_cli",
            "claude",
            "gemini_cli",
            "gemini",
            "codex_cli",
            "codex",
            "opencode_cli",
            "opencode",
            "aider_cli",
            "aider",
        }
    )

    LOCAL_LOOPBACK_HOSTS: tuple[str, ...] = ("localhost", "127.0.0.1", "::1", "host.docker.internal")

    @classmethod
    def classify_egress(
        cls,
        *,
        provider_engine_type: str,
        base_url: str = "",
        provider_name: str = "",
        egress_class: str = "",
    ) -> str:
        """Returns 'local' ONLY when inference stays strictly on-host; returns 'cloud' for all remote APIs and cloud-backed CLIs."""
        explicit = (egress_class or "").strip().lower()
        if explicit in {"local", "cloud"}:
            return explicit

        norm_type = (provider_engine_type or "").strip().lower()
        norm_url = (base_url or "").strip().lower()
        norm_prov = (provider_name or "").strip().lower()

        if norm_type == "extractive_fallback" or norm_prov == "extractive_fallback":
            return "local"

        if norm_type == "local_cli":
            # Cloud-backed CLIs (agy, claude, gemini, codex, opencode, aider) transmit prompts to external clouds (BR-21).
            bin_token = norm_url.replace("cli://", "").split("/")[-1].removesuffix(".exe")
            if norm_prov == "ollama" or bin_token == "ollama":
                return "local"
            return "cloud"

        if norm_type in {"local_http", "ollama"}:
            if not norm_url or any(host in norm_url for host in cls.LOCAL_LOOPBACK_HOSTS):
                return "local"
            return "cloud"

        return "cloud"

    @classmethod
    def requires_dlp(
        cls,
        *,
        dlp_enabled: bool,
        provider_engine_type: str,
        base_url: str = "",
        provider_name: str = "",
    ) -> bool:
        """DLP redaction applies to EVERY cloud-egress engine (including cloud-backed CLIs) (BR-13, BR-21)."""
        if not dlp_enabled:
            return False
        return (
            cls.classify_egress(
                provider_engine_type=provider_engine_type,
                base_url=base_url,
                provider_name=provider_name,
            )
            == "cloud"
        )

    @classmethod
    def check_provider_allowed(
        cls,
        *,
        project_sovereign_only: bool,
        provider_engine_type: str,
        base_url: str,
        provider_name: str = "",
    ) -> ErrorOr[bool]:
        if not project_sovereign_only:
            return ErrorOr.ok(True)
        egress = cls.classify_egress(
            provider_engine_type=provider_engine_type,
            base_url=base_url,
            provider_name=provider_name,
        )
        if egress == "local":
            return ErrorOr.ok(True)
        return ErrorOr.fail(
            DomainError.forbidden(
                "sovereign_policy_violation",
                "El proyecto tiene activa la política 'sovereign_only'; está prohibido enviar fragmentos hacia proveedores con egreso 'cloud' (incluyendo APIs y CLIs respaldados por la nube) (BR-13, BR-21).",
            )
        )
