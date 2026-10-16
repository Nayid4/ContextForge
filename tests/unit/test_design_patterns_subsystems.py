"""Unit tests validating the architectural Design Patterns across Database, Storage, and LLM subsystems.

Verifies:
- Options Pattern: DatabaseConnectionOptions, StorageOptions, LLMOptions, EmbeddingOptions
- Strategy Pattern: IDatabaseStrategy, ILLMClientStrategy, IEmbeddingStrategy
- Template Method Pattern: BaseFileStorageAdapter lifecycle hooks & fallback behavior
- Factory Pattern: DatabaseFactory, StorageFactory, LLMFactory registries & delegation
"""

from __future__ import annotations

import tempfile
from pathlib import Path
import pytest
from domain.infrastructure_config.entities import (
    DatabaseConfiguration,
    DatabaseProvider,
    StorageConfiguration,
    StorageProvider,
)
from domain.llm.entities import EngineType, LLMConfiguration, LLMProvider
from infrastructure.external.llm.cli_process_client import CLIProcessClient
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.llm_factory import LLMFactory
from infrastructure.external.llm.llm_strategies import (
    EmbeddingOptions,
    LLMOptions,
    OllamaLLMStrategy,
)
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.ollama_client import OllamaHttpClient
from infrastructure.persistence.database_factory import DatabaseFactory
from infrastructure.persistence.database_strategies import (
    DatabaseConnectionOptions,
    IDatabaseStrategy,
    SqliteDatabaseStrategy,
)
from infrastructure.storage.storage_factory import (
    BaseFileStorageAdapter,
    LocalFileStorageAdapter,
    S3StorageAdapter,
    StorageFactory,
    StorageOptions,
    SupabaseStorageAdapter,
)


# ==============================================================================
# 1. DATABASE SUBSYSTEM: Options, Strategy & Factory
# ==============================================================================


class TestDatabasePatterns:
    """Validate Options, Strategy, and Factory patterns for multi-database engines."""

    def test_database_options_pattern_extraction(self) -> None:
        cfg = DatabaseConfiguration(
            id="pg-1",
            provider=DatabaseProvider.POSTGRESQL,
            name="Postgres Production",
            host="db.example.internal",
            port=5432,
            database_name="app_db",
            username="postgres_user",
            password="secret_password",
        )
        options = DatabaseConnectionOptions.from_config(cfg)

        assert options.provider == DatabaseProvider.POSTGRESQL
        assert options.name == "Postgres Production"
        assert options.host == "db.example.internal"
        assert options.port == 5432
        assert options.database_name == "app_db"
        assert "postgresql+asyncpg://" in options.connection_url

    def test_database_factory_strategy_resolution(self) -> None:
        sqlite_strategy = DatabaseFactory.get_strategy(DatabaseProvider.SQLITE)
        assert isinstance(sqlite_strategy, SqliteDatabaseStrategy)

        pg_strategy = DatabaseFactory.get_strategy(DatabaseProvider.POSTGRESQL)
        assert pg_strategy is not None

        supabase_strategy = DatabaseFactory.get_strategy(DatabaseProvider.SUPABASE)
        assert supabase_strategy is not None

    @pytest.mark.asyncio
    async def test_database_custom_strategy_registration(self) -> None:
        class MockCustomStrategy:
            async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
                return True, f"Mocked {options.name} successfully", 4.2

        custom_strategy = MockCustomStrategy()
        DatabaseFactory.register_strategy(DatabaseProvider.MONGODB, custom_strategy)

        cfg = DatabaseConfiguration(
            id="mongo-test",
            provider=DatabaseProvider.MONGODB,
            name="Test Mongo",
        )
        ok, msg, latency = await DatabaseFactory.test_connection(cfg)
        assert ok is True
        assert "Mocked Test Mongo successfully" in msg
        assert latency == 4.2

    @pytest.mark.asyncio
    async def test_sqlite_local_strategy_execution(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "test.db"
            cfg = DatabaseConfiguration(
                id="sqlite-local",
                provider=DatabaseProvider.SQLITE,
                name="Local SQLite",
                connection_url=f"sqlite+aiosqlite:///{db_path}",
            )
            ok, msg, latency = await DatabaseFactory.test_connection(cfg)
            assert ok is True
            assert "Motor SQLite Local conectado" in msg
            assert latency >= 0


# ==============================================================================
# 2. STORAGE SUBSYSTEM: Options, Template Method, Strategy & Factory
# ==============================================================================


class TestStoragePatterns:
    """Validate Options, Template Method, and Factory patterns for file storage."""

    def test_storage_options_pattern_extraction(self) -> None:
        cfg = StorageConfiguration(
            id="s3-1",
            provider=StorageProvider.S3,
            name="AWS S3 Architecture Bucket",
            bucket_name="architecture-docs",
            endpoint_url="https://s3.us-west-2.amazonaws.com",
            access_key="AKIA12345",
            secret_key="SECRET9876",
            base_path="./docs",
            sync_local_mirror=True,
        )
        options = StorageOptions.from_config(cfg)

        assert options.provider == StorageProvider.S3
        assert options.bucket_name == "architecture-docs"
        assert options.endpoint_url == "https://s3.us-west-2.amazonaws.com"
        assert options.access_key == "AKIA12345"
        assert options.sync_local_mirror is True

    @pytest.mark.asyncio
    async def test_template_method_local_storage_lifecycle(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            options = StorageOptions(
                provider=StorageProvider.LOCAL_FS,
                base_path=tmpdir,
            )
            adapter = LocalFileStorageAdapter(options)

            # 1. Save (sanitizes path, writes file)
            saved_path = await adapter.save_file("/subfolder/guide.md", b"# Architecture Guide")
            assert Path(saved_path).is_file()

            # 2. Read
            content = await adapter.read_file("subfolder/guide.md")
            assert content == b"# Architecture Guide"

            # 3. Test Connection
            ok, msg, latency = await adapter.test_connection()
            assert ok is True
            assert "Almacenamiento Local Soberano activo" in msg

            # 4. Delete
            deleted = await adapter.delete_file("subfolder/guide.md")
            assert deleted is True
            assert not Path(saved_path).exists()

    @pytest.mark.asyncio
    async def test_template_method_remote_storage_with_local_mirror_sync(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            cfg = StorageConfiguration(
                id="s3-mock",
                provider=StorageProvider.S3,
                name="S3 Mock",
                bucket_name="test-bucket",
                base_path=tmpdir,
                sync_local_mirror=True,
            )
            adapter = StorageFactory.create_gateway(cfg)
            assert isinstance(adapter, S3StorageAdapter)
            assert isinstance(adapter, BaseFileStorageAdapter)

            # Save through template method: should write to local mirror and return s3 URI
            uri = await adapter.save_file("adrs/001_event.md", b"# ADR 001")
            assert uri == "s3://test-bucket/adrs/001_event.md"

            # Check that local mirror actually contains the file
            mirror_file = Path(tmpdir) / "adrs" / "001_event.md"
            assert mirror_file.is_file()
            assert mirror_file.read_bytes() == b"# ADR 001"

            # Read through template method: falls back to mirror
            read_bytes = await adapter.read_file("adrs/001_event.md")
            assert read_bytes == b"# ADR 001"

    def test_storage_factory_creates_correct_strategies(self) -> None:
        local_cfg = StorageConfiguration(provider=StorageProvider.LOCAL_FS)
        assert isinstance(StorageFactory.create_gateway(local_cfg), LocalFileStorageAdapter)

        supabase_cfg = StorageConfiguration(
            provider=StorageProvider.SUPABASE_STORAGE,
            endpoint_url="https://xyz.supabase.co",
            secret_key="anon-key",
        )
        assert isinstance(StorageFactory.create_gateway(supabase_cfg), SupabaseStorageAdapter)


# ==============================================================================
# 3. LLM SUBSYSTEM: Options, Strategy & Factory
# ==============================================================================


class TestLLMPatterns:
    """Validate Options, Strategy, and Factory patterns for LLM and Embedding clients."""

    def test_llm_options_pattern_extraction(self) -> None:
        cfg = LLMConfiguration(
            provider=LLMProvider.GEMINI,
            name="Gemini 2.5 Flash",
            api_key="AIzaSyDummyKey",
            default_model="gemini-2.5-flash",
            base_url="https://generativelanguage.googleapis.com/v1beta",
        )
        options = LLMOptions.from_config(cfg)

        assert options.provider == LLMProvider.GEMINI
        assert options.api_key == "AIzaSyDummyKey"
        assert options.default_model == "gemini-2.5-flash"

    def test_llm_factory_instantiates_concrete_strategies(self) -> None:
        # 1. Ollama
        ollama_cfg = LLMConfiguration(provider=LLMProvider.OLLAMA)
        client = LLMFactory.create_client(ollama_cfg)
        assert isinstance(client, OllamaHttpClient)

        # 2. Gemini
        gemini_cfg = LLMConfiguration(provider=LLMProvider.GEMINI, api_key="test-key")
        client = LLMFactory.create_client(gemini_cfg)
        assert isinstance(client, GeminiHttpClient)

        # 3. OpenAI
        openai_cfg = LLMConfiguration(provider=LLMProvider.OPENAI, api_key="sk-test")
        client = LLMFactory.create_client(openai_cfg)
        assert isinstance(client, OpenAIHttpClient)

        # 4. DeepSeek
        deepseek_cfg = LLMConfiguration(provider=LLMProvider.DEEPSEEK, api_key="sk-deepseek")
        client = LLMFactory.create_client(deepseek_cfg)
        assert isinstance(client, OpenAIHttpClient)

        # 5. CLI Agent
        cli_cfg = LLMConfiguration(
            provider=LLMProvider.CLAUDE_CODE_CLI,
            engine_type=EngineType.LOCAL_CLI,
            cli_command="claude",
        )
        client = LLMFactory.create_client(cli_cfg)
        assert isinstance(client, CLIProcessClient)

    @pytest.mark.asyncio
    async def test_embedding_options_and_strategy_delegation(self) -> None:
        # Test error handling boundary of test_embedding_connection with offline host
        result = await LLMFactory.test_embedding_connection(
            embedding_provider="ollama",
            embedding_model="nomic-embed-text",
            base_url="http://127.0.0.1:59999",  # unreachable port
        )
        assert "healthy" in result
        assert result["healthy"] is False
        assert result["provider"] == "ollama"
        assert "latency_ms" in result

    def test_modular_strategy_files_importability(self) -> None:
        """Verify each strategy lives in its own decoupled module for readability."""
        from infrastructure.persistence.strategies.firebase import FirebaseDatabaseStrategy
        from infrastructure.persistence.strategies.mongo import MongoDatabaseStrategy
        from infrastructure.persistence.strategies.postgres import PostgresDatabaseStrategy
        from infrastructure.persistence.strategies.sqlite import SqliteDatabaseStrategy
        from infrastructure.persistence.strategies.sqlserver import SqlServerDatabaseStrategy
        from infrastructure.persistence.strategies.supabase import SupabaseDatabaseStrategy
        from infrastructure.storage.strategies.firebase import FirebaseStorageAdapter
        from infrastructure.storage.strategies.local import LocalFileStorageAdapter
        from infrastructure.storage.strategies.s3 import S3StorageAdapter
        from infrastructure.storage.strategies.supabase import SupabaseStorageAdapter
        from infrastructure.external.llm.strategies.anthropic import AnthropicLLMStrategy
        from infrastructure.external.llm.strategies.cli import CliLLMStrategy
        from infrastructure.external.llm.strategies.deepseek import DeepSeekLLMStrategy
        from infrastructure.external.llm.strategies.embeddings.gemini import GeminiEmbeddingStrategy
        from infrastructure.external.llm.strategies.embeddings.ollama import OllamaEmbeddingStrategy
        from infrastructure.external.llm.strategies.embeddings.openai import OpenAICompatibleEmbeddingStrategy
        from infrastructure.external.llm.strategies.embeddings.voyage import AnthropicVoyageEmbeddingStrategy
        from infrastructure.external.llm.strategies.gemini import GeminiLLMStrategy
        from infrastructure.external.llm.strategies.ollama import OllamaLLMStrategy
        from infrastructure.external.llm.strategies.openai_cloud import OpenAICloudLLMStrategy
        from infrastructure.external.llm.strategies.openai_compat import OpenAICompatibleLLMStrategy

        assert SqliteDatabaseStrategy is not None
        assert PostgresDatabaseStrategy is not None
        assert SupabaseDatabaseStrategy is not None
        assert SqlServerDatabaseStrategy is not None
        assert MongoDatabaseStrategy is not None
        assert FirebaseDatabaseStrategy is not None

        assert LocalFileStorageAdapter is not None
        assert SupabaseStorageAdapter is not None
        assert S3StorageAdapter is not None
        assert FirebaseStorageAdapter is not None

        assert CliLLMStrategy is not None
        assert OllamaLLMStrategy is not None
        assert OpenAICompatibleLLMStrategy is not None
        assert OpenAICloudLLMStrategy is not None
        assert DeepSeekLLMStrategy is not None
        assert AnthropicLLMStrategy is not None
        assert GeminiLLMStrategy is not None
        assert GeminiEmbeddingStrategy is not None
        assert OpenAICompatibleEmbeddingStrategy is not None
        assert AnthropicVoyageEmbeddingStrategy is not None
        assert OllamaEmbeddingStrategy is not None

