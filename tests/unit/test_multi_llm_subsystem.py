"""Unit and Integration Tests for Multi-LLM Provider Architecture & API Docs."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch
import httpx
import pytest
from httpx import Response
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from domain.llm.entities import LLMConfiguration, LLMProvider
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.anthropic_client import AnthropicHttpClient
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.llm_factory import LLMFactory
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.ollama_client import OllamaHttpClient
from infrastructure.persistence.models.base_model import Base
from infrastructure.repositories.sql_llm_config_repo import SqlLLMConfigRepository
from application.settings.commands import (
    ActivateLLMProviderCommand,
    SaveLLMConfigCommand,
    TestLLMConnectionCommand,
)
from application.settings.handlers import (
    ActivateLLMProviderCommandHandler,
    GetActiveLLMConfigQueryHandler,
    GetLLMConfigsQueryHandler,
    SaveLLMConfigCommandHandler,
    TestLLMConnectionCommandHandler,
)
from application.settings.queries import GetActiveLLMConfigQuery, GetLLMConfigsQuery
from main import app


@pytest.fixture
async def async_db_session() -> AsyncSession:
    """Provide an isolated in-memory SQLite session for testing."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with async_session() as session:
        yield session
    await engine.dispose()


class TestLLMDomainEntities:
    """Test LLM domain entities and value objects."""

    def test_llm_provider_enum_values(self) -> None:
        assert LLMProvider.OLLAMA.value == "ollama"
        assert LLMProvider.OPENAI.value == "openai"
        assert LLMProvider.ANTHROPIC.value == "anthropic"
        assert LLMProvider.DEEPSEEK.value == "deepseek"
        assert LLMProvider.GEMINI.value == "gemini"

    def test_llm_configuration_key_masking(self) -> None:
        cfg_empty = LLMConfiguration(provider=LLMProvider.OPENAI, api_key="")
        assert cfg_empty.mask_api_key() == ""

        cfg_short = LLMConfiguration(provider=LLMProvider.OPENAI, api_key="123456")
        assert cfg_short.mask_api_key() == "••••••••"

        cfg_normal = LLMConfiguration(provider=LLMProvider.OPENAI, api_key="sk-proj-1234567890abcd")
        masked = cfg_normal.mask_api_key()
        assert masked.startswith("sk-p")
        assert masked.endswith("abcd")
        assert "••••••••" in masked

    def test_llm_configuration_to_dict(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.ANTHROPIC,
            name="Claude 3.5",
            api_key="sk-ant-api03-secretkey12345678",
            default_model="claude-3-5-sonnet-20241022",
            is_active=True,
        )
        d_masked = cfg.to_dict(mask_key=True)
        assert d_masked["provider"] == "anthropic"
        assert d_masked["is_active"] is True
        assert "secretkey" not in d_masked["api_key"]
        assert d_masked["has_api_key"] is True

        d_unmasked = cfg.to_dict(mask_key=False)
        assert d_unmasked["api_key"] == "sk-ant-api03-secretkey12345678"


class TestLLMFactory:
    """Test dynamic adapter instantiation in LLMFactory."""

    def test_creates_ollama_client(self) -> None:
        cfg = LLMConfiguration(provider=LLMProvider.OLLAMA, base_url="http://localhost:11434")
        client = LLMFactory.create_client(cfg)
        assert isinstance(client, OllamaHttpClient)

    def test_creates_openai_client(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.OPENAI,
            api_key="sk-test",
            base_url="https://api.openai.com/v1",
            default_model="gpt-4o",
        )
        client = LLMFactory.create_client(cfg)
        assert isinstance(client, OpenAIHttpClient)

    def test_creates_anthropic_client(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.ANTHROPIC,
            api_key="sk-ant",
            default_model="claude-3-5-sonnet",
        )
        client = LLMFactory.create_client(cfg)
        assert isinstance(client, AnthropicHttpClient)

    def test_creates_deepseek_client(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.DEEPSEEK,
            api_key="sk-deepseek",
            default_model="deepseek-chat",
        )
        client = LLMFactory.create_client(cfg)
        assert isinstance(client, OpenAIHttpClient)

    def test_creates_gemini_client(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.GEMINI,
            api_key="AIzaSyTest",
            default_model="gemini-1.5-flash",
        )
        client = LLMFactory.create_client(cfg)
        assert isinstance(client, GeminiHttpClient)


class TestLLMClientAdapters:
    """Test HTTP client adapters with mocked networking."""

    @pytest.mark.asyncio
    async def test_ollama_test_connection_healthy(self) -> None:
        client = OllamaHttpClient(base_url="http://localhost:11434")
        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {"version": "0.5.4"}

        with patch("httpx.AsyncClient.get", return_value=mock_response):
            healthy, msg, latency = await client.test_connection()
            assert healthy is True
            assert "0.5.4" in msg
            assert latency >= 0.0

    @pytest.mark.asyncio
    async def test_ollama_test_connection_error(self) -> None:
        client = OllamaHttpClient(base_url="http://localhost:11434")
        with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused")):
            healthy, msg, latency = await client.test_connection()
            assert healthy is False
            assert "inaccesible" in msg

    @pytest.mark.asyncio
    async def test_openai_test_connection_success(self) -> None:
        client = OpenAIHttpClient(api_key="sk-valid-key")
        mock_resp = MagicMock(status_code=200)
        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            healthy, msg, latency = await client.test_connection()
            assert healthy is True
            assert "exitosa" in msg

    @pytest.mark.asyncio
    async def test_openai_test_connection_unauthorized(self) -> None:
        client = OpenAIHttpClient(api_key="sk-invalid")
        mock_resp = MagicMock(status_code=401)
        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            healthy, msg, latency = await client.test_connection()
            assert healthy is False
            assert "inválida" in msg

    @pytest.mark.asyncio
    async def test_openai_test_connection_missing_key(self) -> None:
        client = OpenAIHttpClient(api_key="")
        healthy, msg, latency = await client.test_connection()
        assert healthy is False
        assert "no configurada" in msg

    @pytest.mark.asyncio
    async def test_anthropic_test_connection(self) -> None:
        client = AnthropicHttpClient(api_key="sk-ant-test")
        mock_resp = MagicMock(status_code=200)
        with patch("httpx.AsyncClient.post", return_value=mock_resp):
            healthy, msg, latency = await client.test_connection()
            assert healthy is True
            assert "Anthropic Claude" in msg

    @pytest.mark.asyncio
    async def test_openai_generate_embedding(self) -> None:
        client = OpenAIHttpClient(api_key="sk-test")
        mock_resp = MagicMock(status_code=200)
        mock_resp.json.return_value = {"data": [{"embedding": [0.1, 0.2, 0.3]}]}
        with patch("httpx.AsyncClient.post", return_value=mock_resp):
            vec = await client.generate_embedding(model="text-embedding-3-small", text="hello")
            assert vec == [0.1, 0.2, 0.3]

    @pytest.mark.asyncio
    async def test_gemini_get_installed_models(self) -> None:
        client = GeminiHttpClient(api_key="AIzaSy")
        models = await client.get_installed_models()
        assert any(m["name"] == "gemini-1.5-flash" for m in models)


class TestSqlLLMConfigRepository:
    """Test SQL Repository persistence and atomic provider switching."""

    @pytest.mark.asyncio
    async def test_get_all_seeds_defaults(self, async_db_session: AsyncSession) -> None:
        repo = SqlLLMConfigRepository(async_db_session)
        configs = await repo.get_all()
        assert len(configs) >= 5
        provider_slugs = {c.provider.value for c in configs}
        assert "ollama" in provider_slugs
        assert "openai" in provider_slugs
        assert "anthropic" in provider_slugs
        assert "deepseek" in provider_slugs
        assert "gemini" in provider_slugs

        active = await repo.get_active()
        assert active.provider == LLMProvider.OLLAMA
        assert active.is_active is True

    @pytest.mark.asyncio
    async def test_set_active_provider_atomically(self, async_db_session: AsyncSession) -> None:
        repo = SqlLLMConfigRepository(async_db_session)
        await repo.get_all()  # seed

        # Switch to Claude
        await repo.set_active_provider(LLMProvider.ANTHROPIC)
        active = await repo.get_active()
        assert active.provider == LLMProvider.ANTHROPIC
        assert active.is_active is True

        # Verify Ollama is now inactive
        ollama_cfg = await repo.get_by_provider(LLMProvider.OLLAMA)
        assert ollama_cfg is not None
        assert ollama_cfg.is_active is False

    @pytest.mark.asyncio
    async def test_save_and_update_credentials(self, async_db_session: AsyncSession) -> None:
        repo = SqlLLMConfigRepository(async_db_session)
        await repo.get_all()

        openai_cfg = await repo.get_by_provider(LLMProvider.OPENAI)
        assert openai_cfg is not None
        openai_cfg.api_key = "sk-new-super-secret"
        openai_cfg.default_model = "gpt-4o"
        await repo.save(openai_cfg)

        reloaded = await repo.get_by_provider(LLMProvider.OPENAI)
        assert reloaded is not None
        assert reloaded.api_key == "sk-new-super-secret"
        assert reloaded.default_model == "gpt-4o"


class TestLLMCQRSApplicationHandlers:
    """Test Application CQRS handlers."""

    @pytest.mark.asyncio
    async def test_save_and_activate_handlers(self, async_db_session: AsyncSession) -> None:
        repo = SqlLLMConfigRepository(async_db_session)
        await repo.get_all()

        save_handler = SaveLLMConfigCommandHandler(repo)
        cmd_save = SaveLLMConfigCommand(
            provider="deepseek",
            name="DeepSeek Pro",
            api_key="sk-deepseek-123",
            base_url="https://api.deepseek.com",
            default_model="deepseek-coder",
        )
        saved = await save_handler.handle(cmd_save)
        assert saved.name == "DeepSeek Pro"
        assert saved.default_model == "deepseek-coder"

        activate_handler = ActivateLLMProviderCommandHandler(repo)
        active = await activate_handler.handle(ActivateLLMProviderCommand(provider="deepseek"))
        assert active.provider == LLMProvider.DEEPSEEK
        assert active.is_active is True

        get_active_handler = GetActiveLLMConfigQueryHandler(repo)
        current = await get_active_handler.handle(GetActiveLLMConfigQuery())
        assert current.provider == LLMProvider.DEEPSEEK

    @pytest.mark.asyncio
    async def test_test_connection_handler(self) -> None:
        handler = TestLLMConnectionCommandHandler()
        with patch("infrastructure.external.llm.openai_client.OpenAIHttpClient.test_connection", return_value=(True, "OK", 55.4)):
            res = await handler.handle(TestLLMConnectionCommand(
                provider="openai",
                api_key="sk-test",
            ))
            assert res["healthy"] is True
            assert res["latency_ms"] == 55.4
            assert res["provider"] == "openai"


class TestLLMRESTApiAndIntegrationGuide:
    """Test REST API routes and external documentation guide view."""

    @pytest.mark.asyncio
    async def test_get_llm_settings_endpoint(self) -> None:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/v1/settings/llm")
            assert res.status_code == 200
            data = res.json()
            assert "providers" in data
            assert len(data["providers"]) >= 5
            assert "active_provider" in data

    @pytest.mark.asyncio
    async def test_save_and_activate_llm_settings_endpoint(self) -> None:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            # Save Gemini config
            save_payload = {
                "provider": "gemini",
                "name": "Google Gemini 1.5",
                "api_key": "AIzaSyTestKey",
                "base_url": "https://generativelanguage.googleapis.com/v1beta/openai",
                "default_model": "gemini-1.5-flash",
                "temperature": 0.2,
                "max_tokens": 4096,
            }
            res_save = await client.post("/api/v1/settings/llm", json=save_payload)
            assert res_save.status_code == 200
            assert res_save.json()["status"] == "success"

            # Activate Gemini
            res_act = await client.post("/api/v1/settings/llm/activate", json={"provider": "gemini"})
            assert res_act.status_code == 200
            assert res_act.json()["active_provider"] == "gemini"

            # Reset back to Ollama
            res_reset = await client.post("/api/v1/settings/llm/activate", json={"provider": "ollama"})
            assert res_reset.status_code == 200
            assert res_reset.json()["active_provider"] == "ollama"

    @pytest.mark.asyncio
    async def test_test_connection_endpoint(self) -> None:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            payload = {
                "provider": "openai",
                "api_key": "sk-test",
            }
            with patch("infrastructure.external.llm.openai_client.OpenAIHttpClient.test_connection", return_value=(True, "Conectado", 72.1)):
                res = await client.post("/api/v1/settings/llm/test", json=payload)
                assert res.status_code == 200
                data = res.json()
                assert data["healthy"] is True
                assert data["latency_ms"] == 72.1

    @pytest.mark.asyncio
    async def test_integration_guide_view(self) -> None:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/docs/integration-guide")
            assert res.status_code == 200
            html = res.text
            assert "Guía de Integración Externa" in html
            assert "Swagger / OpenAPI UI" in html
            assert "connectContextForgeChat" in html
            assert "ask_contextforge" in html
            assert "cf-chat-bubble" in html

