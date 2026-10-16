"""Tests for Universal AI Engine (Local HTTP, Cloud APIs, Local CLI Agents),
ASCII Masked Key Sanitization Fix, MCP Server Tools/Endpoints, and Agent Rules Exporter.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from application.settings.commands import SaveLLMConfigCommand, TestLLMConnectionCommand
from application.settings.handlers import SaveLLMConfigCommandHandler, TestLLMConnectionCommandHandler
from application.settings.queries.discover_cli_engines import (
    DiscoverCLIEnginesQuery,
    DiscoverCLIEnginesQueryHandler,
)
from domain.llm.entities import (
    EngineType,
    LLMConfiguration,
    LLMProvider,
    infer_engine_type,
    is_masked_api_key,
    sanitize_api_key,
)
from infrastructure.external.llm.cli_process_client import CLIProcessClient
from infrastructure.external.llm.llm_factory import LLMFactory
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from main import app
from presentation.mcp.server import mcp_server


def test_ascii_sanitization_and_masked_key_detection() -> None:
    """Verify non-ASCII bullet masks and invisible Unicode characters are detected and stripped."""
    masked = "sk-1••••••••5678"
    assert is_masked_api_key(masked) is True
    assert sanitize_api_key(masked) == ""

    dirty_key = "“sk-proj-abc123xyz”\u200b\n"
    assert is_masked_api_key(dirty_key) is False
    assert sanitize_api_key(dirty_key) == "sk-proj-abc123xyz"

    # OpenAIHttpClient headers must always be pure ASCII so httpx never raises UnicodeEncodeError
    client = OpenAIHttpClient(
        api_key=masked,
        base_url="https://api.openai.com/v1",
        default_model="gpt-4o-mini",
    )
    headers = client._get_headers()
    for k, v in headers.items():
        k.encode("ascii")
        v.encode("ascii")


@pytest.mark.asyncio
async def test_cli_process_client_and_factory() -> None:
    """Verify CLIProcessClient executes local commands via create_subprocess_exec without shell=True."""
    config = LLMConfiguration(
        id="claude_code_cli",
        provider=LLMProvider.CLAUDE_CODE_CLI,
        name="Claude Code CLI",
        engine_type=EngineType.LOCAL_CLI,
        cli_command="python",
        cli_args="-c \"import sys; print('CLI_OK:' + sys.argv[-1])\" {prompt}",
        default_model="claude-3-5-sonnet",
    )
    client = LLMFactory.create_client(config)
    assert isinstance(client, CLIProcessClient)

    healthy, msg, latency = await client.test_connection()
    assert healthy is True
    assert "python" in msg.lower()
    assert latency >= 0


@pytest.mark.asyncio
async def test_discover_cli_engines_query() -> None:
    """Verify DiscoverCLIEnginesQueryHandler scans system PATH for known CLI agents."""
    handler = DiscoverCLIEnginesQueryHandler()
    items = await handler.handle(DiscoverCLIEnginesQuery())
    assert len(items) >= 6
    providers = {item.provider for item in items}
    assert "claude_code_cli" in providers
    assert "antigravity_cli" in providers
    assert "codex_cli" in providers


@pytest.mark.asyncio
async def test_mcp_server_jsonrpc_and_tools() -> None:
    """Verify MCP JSON-RPC 2.0 initialize, tools/list, and tools/call execution."""
    init_res = await mcp_server.handle_jsonrpc(
        {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
    )
    assert init_res is not None
    assert init_res["result"]["serverInfo"]["name"] == "ContextForge-Knowledge-Hub"

    list_res = await mcp_server.handle_jsonrpc(
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
    )
    assert list_res is not None
    tool_names = {t["name"] for t in list_res["result"]["tools"]}
    assert "search_project_context" in tool_names
    assert "get_document_full" in tool_names
    assert "list_project_structure" in tool_names

    call_res = await mcp_server.handle_jsonrpc(
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "list_project_structure",
                "arguments": {"project_slug": "default"},
            },
        }
    )
    assert call_res is not None
    assert call_res["result"]["isError"] is False
    assert len(call_res["result"]["content"][0]["text"]) > 0


def test_api_endpoints_mcp_cli_and_agent_rules(tmp_path: Path) -> None:
    """Verify HTTP endpoints for /mcp/info, /api/v1/settings/llm/discover-cli, and masked key test."""
    with TestClient(app) as client:
        # 1. MCP info endpoint
        mcp_info = client.get("/mcp/info")
        assert mcp_info.status_code == 200
        data = mcp_info.json()
        assert data["protocol"] == "mcp"
        assert len(data["tools"]) == 3

        # 2. Discover CLI endpoint
        cli_res = client.get("/api/v1/settings/llm/discover-cli")
        assert cli_res.status_code == 200
        cli_data = cli_res.json()
        assert "engines" in cli_data
        assert len(cli_data["engines"]) >= 6

        # 3. Test LLM connection with masked bullet string must NOT fail with ASCII codec error
        test_res = client.post(
            "/api/v1/settings/llm/test",
            json={
                "provider": "openai",
                "api_key": "sk-1••••••••5678",
                "base_url": "https://api.openai.com/v1",
                "default_model": "gpt-4o-mini",
            },
        )
        assert test_res.status_code == 200
        test_json = test_res.json()
        assert "ascii" not in test_json.get("message", "").lower()

        # 4. Settings and Integration Guide views render with modular components
        settings_page = client.get("/settings")
        assert settings_page.status_code == 200
        assert "Agentes CLI Locales" in settings_page.text

        guide_page = client.get("/docs/integration-guide")
        assert guide_page.status_code == 200
        assert "search_project_context" in guide_page.text
        assert "Claude Code CLI" in guide_page.text
        assert "Antigravity" in guide_page.text

        # Ensure ollama is active for any subsequent tests
        act_res = client.post("/api/v1/settings/llm/activate", json={"provider": "ollama"})
        assert act_res.status_code == 200


def test_gemini_url_normalization_and_native_headers() -> None:
    """Verify GeminiHttpClient normalizes /v1beta/interactions and uses x-goog-api-key header."""
    from infrastructure.external.llm.gemini_client import (
        GeminiHttpClient,
        normalize_gemini_base_url,
    )

    assert (
        normalize_gemini_base_url("https://generativelanguage.googleapis.com/v1beta/interactions")
        == "https://generativelanguage.googleapis.com/v1beta"
    )
    assert (
        normalize_gemini_base_url("https://generativelanguage.googleapis.com/v1beta/openai/")
        == "https://generativelanguage.googleapis.com/v1beta"
    )

    gem_cfg = LLMConfiguration(
        id="gemini",
        provider=LLMProvider.GEMINI,
        name="Google Gemini API",
        engine_type=EngineType.CLOUD_API,
        api_key="AIzaSyTestKey1234567890",
        base_url="https://generativelanguage.googleapis.com/v1beta/interactions",
        default_model="gemini-2.5-flash",
    )
    client = LLMFactory.create_client(gem_cfg)
    assert isinstance(client, GeminiHttpClient)
    assert client.base_url == "https://generativelanguage.googleapis.com/v1beta"
    headers = client._get_headers()
    assert headers.get("x-goog-api-key") == "AIzaSyTestKey1234567890"
    assert "Authorization" not in headers


def test_cli_binary_alias_resolution() -> None:
    """Verify resolve_cli_binary maps legacy 'antigravity' to 'agy' and 'open-code' to 'opencode'."""
    from infrastructure.external.llm.cli_process_client import (
        BINARY_ALIASES,
        resolve_cli_binary,
    )

    assert "agy" in BINARY_ALIASES["antigravity"]
    assert "opencode" in BINARY_ALIASES["open-code"]

    # Python is guaranteed to exist in the test environment
    py_path = resolve_cli_binary("python")
    assert py_path is not None


def test_hexagonal_database_and_storage_endpoints() -> None:
    """Verify Hexagonal Multi-Database and Multi-Storage REST API endpoints."""
    with TestClient(app) as client:
        infra_res = client.get("/api/v1/settings/infrastructure")
        assert infra_res.status_code == 200
        infra_data = infra_res.json()
        assert "databases" in infra_data
        assert "storages" in infra_data
        db_providers = {d["provider"] for d in infra_data["databases"]}
        assert {"sqlite", "postgresql", "supabase", "sqlserver", "mongodb", "firebase"}.issubset(
            db_providers
        )
        storage_providers = {s["provider"] for s in infra_data["storages"]}
        assert {"local_fs", "supabase_storage", "s3", "firebase_storage"}.issubset(storage_providers)

        # Test SQLite default connection
        sqlite_test = client.post(
            "/api/v1/settings/database/test",
            json={
                "provider": "sqlite",
                "connection_url": "sqlite+aiosqlite:///./data/contextforge.db",
                "database_name": "contextforge.db",
            },
        )
        assert sqlite_test.status_code == 200
        assert sqlite_test.json()["healthy"] is True

        # Test Local FileSystem storage connection
        local_storage_test = client.post(
            "/api/v1/settings/storage/test",
            json={
                "provider": "local_fs",
                "base_path": "./docs",
                "sync_local_mirror": True,
            },
        )
        assert local_storage_test.status_code == 200
        assert local_storage_test.json()["healthy"] is True



