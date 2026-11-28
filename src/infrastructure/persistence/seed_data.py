"""Idempotent Local & QA Seed Data (4 RBAC Roles, Default Project, Taxonomy & Multi-LLM Presets)."""

from __future__ import annotations
import logging
import os
from pathlib import Path
import secrets
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

logger = logging.getLogger("contextforge.bootstrap")
from infrastructure.persistence.models import (
    AgentORM,
    AgentVersionORM,
    LlmConfigurationORM,
    ProjectMemberORM,
    ProjectORM,
    SettingsORM,
    TaxonomyItemORM,
    UserORM,
)
from infrastructure.security import PasswordHasher

SEED_USERS = (
    ("usr-admin", "admin@contextforge.local", "Administrador Plataforma", "Admin123!", "Admin"),
    ("usr-curator", "curator@contextforge.local", "Arquitecto Curador", "Curator123!", "Curator"),
    ("usr-consumer", "dev@contextforge.local", "Desarrollador Consumidor", "Dev123!", "Consumer"),
    ("usr-agent", "agent@contextforge.local", "Agente MCP Automatizado", "Agent123!", "AgentClient"),
)

SEED_MODULES = (
    ("mod-general", "default", "module", "general", "General y Gobernanza", "indigo"),
    ("mod-eng", "default", "module", "engineering", "Ingeniería y Arquitectura", "emerald"),
    ("mod-ers", "default", "module", "ers", "Especificación ERS ISO 29148", "blue"),
    ("tag-rag", "default", "tag", "rag", "RAG Híbrido", "teal"),
    ("tag-ocp", "default", "tag", "solid", "SOLID y Patrones GoF", "amber"),
)

SEED_LLM_PROVIDERS = (
    # (provider, engine_type, name, base_url, default_model, cli_command, cli_args, is_active)
    ("ollama", "local_http", "Ollama Soberano Local", "http://127.0.0.1:11434", "llama3.1:8b", "", "", True),
    ("lmstudio", "local_http", "LM Studio Local (OpenAI API)", "http://127.0.0.1:1234/v1", "local-model", "", "", False),
    ("openai", "cloud_api", "OpenAI GPT-4o / o3", "https://api.openai.com/v1", "gpt-4o-mini", "", "", False),
    ("gemini", "cloud_api", "Google Gemini API", "https://generativelanguage.googleapis.com", "gemini-2.5-flash", "", "", False),
    ("anthropic", "cloud_api", "Anthropic Claude API", "https://api.anthropic.com/v1", "claude-3-5-sonnet-latest", "", "", False),
    ("openrouter", "cloud_api", "OpenRouter Multi-Model", "https://openrouter.ai/api/v1", "openai/gpt-4o-mini", "", "", False),
    ("deepseek", "cloud_api", "DeepSeek API", "https://api.deepseek.com/v1", "deepseek-chat", "", "", False),
    ("antigravity_cli", "local_cli", "Antigravity CLI (agy)", "cli://agy", "default", "agy", "--disable-slash-commands -p", False),
    ("claude_cli", "local_cli", "Claude Code CLI", "cli://claude", "sonnet", "claude", "-p", False),
    ("gemini_cli", "local_cli", "Gemini CLI", "cli://gemini", "gemini-2.5-flash", "gemini", "-p", False),
    ("codex_cli", "local_cli", "OpenAI Codex CLI", "cli://codex", "default", "codex", "exec", False),
    ("opencode_cli", "local_cli", "OpenCode CLI", "cli://opencode", "default", "opencode", "run", False),
    ("aider_cli", "local_cli", "Aider CLI", "cli://aider", "default", "aider", "--no-auto-commits --message", False),
    ("extractive_fallback", "extractive_fallback", "Motor Extractivo Determinista (Sin Red)", "local://extractive", "extractive-v2", "", "", False),
)

def resolve_bootstrap_admin_password(*, auth_mode: str | None = None, app_env: str | None = None) -> tuple[str, bool, bool]:
    """Resolves initial Admin password safely: env var, one-time random secret in enterprise_rbac/prod, or dev seed in pytest/local.

    Returns (password, must_change_password, generated_randomly).
    """
    env_pwd = (os.getenv("CONTEXTFORGE_BOOTSTRAP_ADMIN_PASSWORD") or "").strip()
    if env_pwd:
        force = os.getenv("CONTEXTFORGE_BOOTSTRAP_FORCE_CHANGE", "false").lower() in ("1", "true", "yes")
        return env_pwd, force, False
    eff_mode = (auth_mode or os.getenv("AUTH_MODE", "local")).strip().lower()
    eff_env = (app_env or os.getenv("APP_ENV", "local")).strip().lower()
    if os.getenv("PYTEST_CURRENT_TEST"):
        return "Admin123!", False, False
    if eff_mode == "enterprise_rbac" or eff_env == "prod":
        generated = secrets.token_urlsafe(16)
        return generated, True, True
    return "Admin123!", False, False


async def seed_initial_data(session_maker: async_sessionmaker[AsyncSession], docs_root: str = "./docs") -> None:
    Path(docs_root).mkdir(parents=True, exist_ok=True)
    async with session_maker() as session:
        # 1. Settings
        if (await session.execute(select(SettingsORM).where(SettingsORM.id == "default"))).scalar_one_or_none() is None:
            session.add(SettingsORM(id="default", docs_path=docs_root))

        # 2. Default Project
        if (await session.execute(select(ProjectORM).where(ProjectORM.slug == "default"))).scalar_one_or_none() is None:
            session.add(
                ProjectORM(
                    slug="default",
                    owner_id="usr-admin",
                    name="ContextForge Core",
                    description="Espacio soberano principal de documentación Docs-as-Code y ERS.",
                    path=docs_root,
                    sovereign_only=False,
                    max_quota_mb=2048,
                    is_active=True,
                )
            )

        # 3. RBAC Users (secure bootstrap for initial Admin; dev QA personas only outside prod/enterprise_rbac)
        admin_pwd, admin_must_change, admin_random = resolve_bootstrap_admin_password()
        eff_mode = os.getenv("AUTH_MODE", "local").strip().lower()
        seed_qa_users = bool(os.getenv("PYTEST_CURRENT_TEST")) or eff_mode == "local"
        for uid, email, fname, pwd, role in SEED_USERS:
            if uid != "usr-admin" and not seed_qa_users:
                continue
            if (await session.execute(select(UserORM).where(UserORM.email == email))).scalar_one_or_none() is None:
                eff_pwd = admin_pwd if uid == "usr-admin" else pwd
                eff_must_change = admin_must_change if uid == "usr-admin" else False
                session.add(
                    UserORM(
                        user_id=uid,
                        email=email,
                        full_name=fname,
                        password_hash=PasswordHasher.hash_password(eff_pwd),
                        global_role=role,
                        is_active=True,
                        must_change_password=eff_must_change,
                    )
                )
                if uid == "usr-admin" and admin_random:
                    logger.warning(
                        "BOOTSTRAP ADMIN CREADO (se muestra UNA sola vez; cambio obligatorio al iniciar sesión): email=%s password=%s",
                        email,
                        eff_pwd,
                    )

        # 4. Taxonomy
        for tid, pslug, kind, slug, name, color in SEED_MODULES:
            if (await session.execute(select(TaxonomyItemORM).where(TaxonomyItemORM.id == tid))).scalar_one_or_none() is None:
                session.add(TaxonomyItemORM(id=tid, project_slug=pslug, kind=kind, slug=slug, name=name, color=color))

        # 5. Multi-LLM Presets (+ migrate legacy agy cli_args if present)
        for prov, etype, name, url, model, cli_cmd, cli_args, active in SEED_LLM_PROVIDERS:
            existing_llm = (await session.execute(select(LlmConfigurationORM).where(LlmConfigurationORM.provider == prov))).scalar_one_or_none()
            if existing_llm is None:
                session.add(
                    LlmConfigurationORM(
                        provider=prov,
                        engine_type=etype,
                        name=name,
                        base_url=url,
                        default_model=model,
                        cli_command=cli_cmd,
                        cli_args=cli_args,
                        is_active=active,
                    )
                )
            elif prov == "antigravity_cli" and existing_llm.cli_args in {"", "chat -p", "-p --disable-slash-commands"}:
                existing_llm.cli_args = cli_args

        # 6. Default Project Membership (RBAC por proyecto — BR-23 Owner inicial)
        if (await session.execute(select(ProjectMemberORM).where(ProjectMemberORM.project_slug == "default", ProjectMemberORM.user_id == "usr-admin"))).scalar_one_or_none() is None:
            session.add(
                ProjectMemberORM(
                    member_id="mem-default-admin",
                    project_slug="default",
                    user_id="usr-admin",
                    role="Owner",
                )
            )

        # 7. Default Configurable Agent (`default/assistant`)
        if (await session.execute(select(AgentORM).where(AgentORM.project_slug == "default", AgentORM.slug == "assistant"))).scalar_one_or_none() is None:
            session.add(
                AgentORM(
                    agent_id="agt-default-assistant",
                    project_slug="default",
                    slug="assistant",
                    name="Asistente Principal ContextForge",
                    description="Agente general experto en la documentación, arquitectura y reglas del proyecto default.",
                    system_prompt=(
                        "Eres el asistente técnico especialista del proyecto ContextForge Core. "
                        "Responde con precisión basándote únicamente en la documentación verificada del proyecto y cita siempre [ruta.md]."
                    ),
                    llm_provider="",
                    llm_model="",
                    temperature=0.2,
                    max_tokens=2048,
                    top_k=6,
                    min_grounding_score=0.15,
                    allowed_modules_json="[]",
                    allowed_tags_json="[]",
                    allowed_statuses_json='["published"]',
                    welcome_message="¡Hola! Soy el **Asistente Principal** del proyecto `default`. Pregúntame sobre arquitectura, reglas de negocio o especificaciones.",
                    suggested_questions_json='["¿Cuáles son las reglas clave de arquitectura?", "Resume las decisiones de diseño (ADRs)"]',
                    topic_boundaries="Documentación técnica, arquitectura, reglas de negocio y uso del proyecto.",
                    current_version=1,
                    is_active=True,
                )
            )
            session.add(
                AgentVersionORM(
                    version_id="agt-ver-default-1",
                    agent_id="agt-default-assistant",
                    version_number=1,
                    config_json='{"name":"Asistente Principal ContextForge","temperature":0.2,"top_k":6}',
                    author_id="usr-admin",
                    change_summary="Configuración inicial v1",
                )
            )

        await session.commit()
