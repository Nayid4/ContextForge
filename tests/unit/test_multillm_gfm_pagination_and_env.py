"""Tests for DB-level pagination, GFM Markdown rendering, Multi-LLM real prompt probe, Antigravity CLI, and .env secrets."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from domain.users import LlmProviderConfigEntity
from infrastructure.config import EnvFileLoader
from infrastructure.integrations import (
    AIStrategyFactory,
    CliEngineDiscoveryService,
    CliLlmAdapter,
    HttpMultiLlmAdapter,
    RichMarkdownRenderer,
)
from infrastructure.security import SecretVaultAesGcm
from main import create_app


def test_rich_markdown_renderer_gfm_tables_tasks_and_callouts() -> None:
    sample = (
        "# Guía GFM\n\n"
        "> [!NOTE]\n"
        "> ContextForge soporta alertas tipo GitHub.\n\n"
        "> [!WARNING]\n"
        "> No exponer llaves API en el repositorio.\n\n"
        "| Campo | Valor |\n"
        "| --- | --- |\n"
        "| Motor | Multi-LLM |\n\n"
        "- [x] Paginación real SQL\n"
        "- [ ] Próxima mejora\n"
    )
    html = RichMarkdownRenderer.render(sample)
    assert 'class="cf-callout cf-callout-note"' in html
    assert 'class="cf-callout cf-callout-warning"' in html
    assert 'class="cf-table-wrap"' in html
    assert "<table>" in html and "Multi-LLM" in html
    assert 'type="checkbox"' in html


def test_env_file_loader_loads_secrets_without_overriding_os_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        '# comment\nOPENAI_API_KEY="sk-test-from-dotenv"\nGEMINI_API_KEY=AIza-from-dotenv\n',
        encoding="utf-8",
    )
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "AIza-from-os")

    loaded = EnvFileLoader.load_dotenv_if_present(env_file, force=True)
    assert loaded >= 1
    assert os.getenv("OPENAI_API_KEY") == "sk-test-from-dotenv"
    assert os.getenv("GEMINI_API_KEY") == "AIza-from-os"

    key, source = EnvFileLoader.resolve_provider_api_key("openai", stored_plain="")
    assert key == "sk-test-from-dotenv"
    assert source == "env"

    key_db, source_db = EnvFileLoader.resolve_provider_api_key("openai", stored_plain="sk-from-db")
    assert key_db == "sk-from-db"
    assert source_db == "db"


def test_cli_discovery_and_strategy_factory_include_antigravity_cli() -> None:
    disc = CliEngineDiscoveryService.discover()
    providers = {e["provider"]: e["binary"] for e in disc["engines"]}
    assert providers["antigravity_cli"] == "agy"
    assert providers["claude_cli"] == "claude"
    assert providers["gemini_cli"] == "gemini"

    vault = SecretVaultAesGcm("test-master-key-32-bytes-minimum!!")
    cfg = LlmProviderConfigEntity(
        provider="antigravity_cli",
        engine_type="local_cli",
        name="Antigravity CLI (agy)",
        base_url="cli://agy",
        cli_command="agy",
        cli_args="chat -p",
        default_model="default",
    )
    adapter = AIStrategyFactory.create(cfg, vault)
    assert isinstance(adapter, CliLlmAdapter)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("provider", "engine_type", "base_url", "model", "mock_json"),
    [
        ("ollama", "local_http", "http://127.0.0.1:11434", "llama3.1:8b", {"response": "OK"}),
        ("openai", "cloud_api", "https://api.openai.com/v1", "gpt-4o-mini", {"choices": [{"message": {"content": "OK"}}]}),
        ("gemini", "cloud_api", "https://generativelanguage.googleapis.com", "gemini-2.5-flash", {"candidates": [{"content": {"parts": [{"text": "OK"}]}}]}),
        ("anthropic", "cloud_api", "https://api.anthropic.com/v1", "claude-3-5-sonnet-latest", {"content": [{"type": "text", "text": "OK"}]}),
        ("lmstudio", "local_http", "http://127.0.0.1:1234/v1", "local-model", {"choices": [{"message": {"content": "OK"}}]}),
    ],
)
async def test_multi_llm_check_health_sends_real_prompt(
    provider: str,
    engine_type: str,
    base_url: str,
    model: str,
    mock_json: dict[str, Any],
) -> None:
    cfg = LlmProviderConfigEntity(
        provider=provider,
        engine_type=engine_type,
        name=provider,
        base_url=base_url,
        default_model=model,
    )
    adapter = HttpMultiLlmAdapter(cfg, api_key_plain="test-key" if engine_type == "cloud_api" else "", timeout_sec=5.0)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = mock_json

    mock_client = AsyncMock()
    mock_client.post.return_value = mock_resp
    mock_client.__aenter__.return_value = mock_client
    mock_client.__aexit__.return_value = None

    with patch("infrastructure.integrations.llm.http_multi_llm_adapter.httpx.AsyncClient", return_value=mock_client):
        ok, msg, lat = await adapter.check_health()

    assert ok is True
    assert model in msg and "OK" in msg
    assert lat >= 0.0
    assert mock_client.post.await_count == 1
    sent_payload = mock_client.post.call_args.kwargs.get("json", {})
    assert HttpMultiLlmAdapter.HEALTH_PROBE_PROMPT in str(sent_payload)


def test_real_db_pagination_across_all_lists_and_ui_controls() -> None:
    app = create_app()
    with TestClient(app) as client:
        # Create 2 extra projects so pagination page_size=2 yields >1 pages
        for idx in (1, 2):
            r = client.post(
                "/api/v1/projects",
                json={"name": f"Paginated Project {idx}", "slug": f"pag-proj-{idx}", "description": "Testing SQL pagination"},
            )
            assert r.status_code in (201, 409)

        p1 = client.get("/api/v1/projects?page=1&page_size=2")
        assert p1.status_code == 200
        d1 = p1.json()
        assert d1["page"] == 1 and d1["page_size"] == 2 and d1["total_count"] >= 3
        assert d1["has_prev"] is False and d1["has_next"] is True and len(d1["items"]) == 2

        p2 = client.get("/api/v1/projects?page=2&page_size=2")
        assert p2.status_code == 200
        d2 = p2.json()
        assert d2["page"] == 2 and d2["has_prev"] is True and len(d2["items"]) >= 1

        # UI pagination renders disabled Anterior on page 1 and enabled Siguiente
        ui_p1 = client.get("/projects?page=1&per_page=2")
        assert ui_p1.status_code == 200
        assert 'aria-disabled="true"' in ui_p1.text
        assert "Mostrando" in ui_p1.text

        # API Keys DB pagination
        for idx in (1, 2, 3):
            kr = client.post("/api/v1/auth/api-keys", json={"name": f"Key-{idx}", "role_scope": "AgentClient", "allowed_projects": ["*"]})
            assert kr.status_code == 201
        k_page = client.get("/api/v1/auth/api-keys?page=1&page_size=2")
        assert k_page.status_code == 200
        kd = k_page.json()
        assert kd["total_count"] >= 3 and kd["has_prev"] is False and kd["has_next"] is True and len(kd["items"]) == 2

        # Context Bundles DB pagination
        for idx in (1, 2):
            br = client.post(
                "/api/v1/bundles/compile",
                json={"name": f"Bundle-{idx}", "project_slug": "default", "document_paths": [], "max_tokens": 4000, "export_format": "markdown"},
            )
            assert br.status_code == 201
        b_page = client.get("/api/v1/bundles?project=default&page=1&page_size=1")
        assert b_page.status_code == 200
        bd = b_page.json()
        assert bd["total_count"] >= 2 and bd["has_prev"] is False and bd["has_next"] is True and len(bd["items"]) == 1

        # Indexing Jobs DB pagination
        j_page = client.get("/api/v1/rag/jobs?page=1&page_size=5")
        assert j_page.status_code == 200
        jd = j_page.json()
        assert {"page", "page_size", "total_count", "total_pages", "has_prev", "has_next", "items"} <= set(jd.keys())

        # Seeded Multi-LLM presets (14 providers including antigravity_cli, lmstudio, openrouter, deepseek)
        llms = client.get("/api/v1/settings/llm-providers")
        assert llms.status_code == 200
        prov_names = {p["provider"] for p in llms.json()["items"]}
        assert {"ollama", "lmstudio", "openai", "gemini", "anthropic", "openrouter", "deepseek", "antigravity_cli", "claude_cli", "extractive_fallback"} <= prov_names

        # Preview HTMX renders GFM callouts and tables
        prev = client.post("/docs/preview-htmx", data={"content_markdown": "> [!TIP]\n> Usa .env\n\n| A | B |\n|---|---|\n| 1 | 2 |"})
        assert prev.status_code == 200
        assert "cf-callout-tip" in prev.text and "cf-table-wrap" in prev.text
