"""Domain entities for Universal Multi-LLM, Embeddings & Local CLI Provider Architecture."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from domain.shared_kernel.entities import Entity


class EngineType(str, Enum):
    """Execution engine category for AI inference."""

    CLOUD_API = "cloud_api"      # OpenAI, Anthropic, DeepSeek, Gemini
    LOCAL_HTTP = "local_http"    # Ollama, LM Studio, vLLM, LocalAI (OpenAI-compatible)
    LOCAL_CLI = "local_cli"      # Antigravity (agy), Claude Code (claude), OpenCode (opencode), Codex, Gemini CLI, Aider, Ollama CLI


class LLMProvider(str, Enum):
    """Supported LLM inference providers across Cloud, Local HTTP, and Local CLI."""

    # 1. Local HTTP Servers (Model Inference Servers)
    OLLAMA = "ollama"
    OLLAMA_HTTP = "ollama_http"
    LM_STUDIO = "lm_studio"
    VLLM = "vllm"
    LOCALAI = "localai"

    # 2. Cloud APIs
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"

    # 3. Local CLI Agents & Tools
    ANTIGRAVITY_CLI = "antigravity_cli"
    CLAUDE_CODE_CLI = "claude_code_cli"
    OPEN_CODE_CLI = "open_code_cli"
    CODEX_CLI = "codex_cli"
    GEMINI_CLI = "gemini_cli"
    AIDER_CLI = "aider_cli"
    OLLAMA_CLI = "ollama_cli"


PROVIDER_ECOSYSTEM_CATALOG: dict[str, dict[str, Any]] = {
    "ollama": {
        "ecosystem": "ollama",
        "ecosystem_label": "Ecosistema Ollama Local",
        "capabilities": ["Servidor HTTP Local", "Embeddings Locales", "CLI Nativo"],
        "recommended_models": ["llama3.1:8b", "qwen2.5-coder:7b", "deepseek-r1:8b", "gemma3:4b"],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text", "mxbai-embed-large", "bge-m3", "all-minilm"],
        "embedding_dimensions": [768, 1024, 384],
    },
    "lm_studio": {
        "ecosystem": "local_openai",
        "ecosystem_label": "LM Studio Local Server",
        "capabilities": ["Servidor OpenAI-Compatible", "Embeddings /v1/embeddings", "Descubrimiento GGUF"],
        "recommended_models": ["qwen2.5-coder-7b-instruct", "google/gemma-4-26b-a4b", "llama-3.2-3b-instruct"],
        "embedding_provider": "lm_studio",
        "default_embedding_model": "text-embedding-nomic-embed-text-v1.5",
        "recommended_embedding_models": ["text-embedding-nomic-embed-text-v1.5", "nomic-embed-text"],
        "embedding_dimensions": [768],
    },
    "vllm": {
        "ecosystem": "local_openai",
        "ecosystem_label": "vLLM High-Throughput Server",
        "capabilities": ["Servidor OpenAI-Compatible", "Health Check /health", "Auto Tool Choice"],
        "recommended_models": ["Qwen/Qwen3-Coder-30B-A3B-Instruct", "meta-llama/Llama-3.1-8B-Instruct", "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text", "BAAI/bge-m3"],
        "embedding_dimensions": [768, 1024],
    },
    "localai": {
        "ecosystem": "local_openai",
        "ecosystem_label": "LocalAI / Jan Server",
        "capabilities": ["Servidor OpenAI-Compatible", "Embeddings Locales"],
        "recommended_models": ["llama-3.1-8b-instruct", "mistral-7b-instruct"],
        "embedding_provider": "localai",
        "default_embedding_model": "text-embedding-ada-002",
        "recommended_embedding_models": ["text-embedding-ada-002", "nomic-embed-text"],
        "embedding_dimensions": [768, 1536],
    },
    "gemini": {
        "ecosystem": "google",
        "ecosystem_label": "Google AI Studio (Gemini & Antigravity)",
        "capabilities": ["Interactions API (/v1beta/interactions)", "GenerateContent API", "Embeddings Multimodal MRL (gemini-embedding-2)", "CLI (agy / gemini)"],
        "recommended_models": ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-3.1-pro-preview"],
        "embedding_provider": "gemini",
        "default_embedding_model": "gemini-embedding-2",
        "recommended_embedding_models": ["gemini-embedding-2", "gemini-embedding-001"],
        "embedding_dimensions": [768, 1536, 3072],
    },
    "openai": {
        "ecosystem": "openai",
        "ecosystem_label": "OpenAI Platform (ChatGPT & Codex)",
        "capabilities": ["Responses API (/v1/responses)", "Chat Completions (/v1/chat/completions)", "Embeddings v3", "Codex CLI"],
        "recommended_models": ["gpt-4o-mini", "gpt-4o", "gpt-5.4", "gpt-5.4-mini", "gpt-5-mini", "gpt-6-astra", "gpt-6-sol", "o3"],
        "embedding_provider": "openai",
        "default_embedding_model": "text-embedding-3-small",
        "recommended_embedding_models": ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"],
        "embedding_dimensions": [1536, 3072, 512],
    },
    "anthropic": {
        "ecosystem": "anthropic",
        "ecosystem_label": "Anthropic Claude Platform (+ Voyage AI)",
        "capabilities": ["Messages API (/v1/messages)", "Prompt Caching", "Embeddings vía Voyage AI (MongoDB Atlas)", "Claude Code CLI"],
        "recommended_models": ["claude-sonnet-4-5", "claude-3-7-sonnet-latest", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
        "embedding_provider": "voyage",
        "default_embedding_model": "voyage-4",
        "recommended_embedding_models": ["voyage-4", "voyage-4-large", "voyage-code-4", "voyage-4-lite", "voyage-context-4"],
        "embedding_dimensions": [1024, 512, 2048],
    },
    "deepseek": {
        "ecosystem": "deepseek",
        "ecosystem_label": "DeepSeek Platform (V3 & R1 Reasoner)",
        "capabilities": ["OpenAI-Compatible API", "Chain-of-Thought Reasoning (reasoning_content)"],
        "recommended_models": ["deepseek-chat", "deepseek-reasoner"],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text", "text-embedding-3-small"],
        "embedding_dimensions": [768, 1536],
    },
    "antigravity_cli": {
        "ecosystem": "google",
        "ecosystem_label": "Google Antigravity CLI (agy)",
        "capabilities": ["Binario Local agy.exe", "Gestión de Proyectos (agy init / status)", "Integración MCP Nativa"],
        "recommended_models": ["gemini-3.8-flash", "gemini-2.5-pro", "default"],
        "embedding_provider": "gemini",
        "default_embedding_model": "gemini-embedding-2",
        "recommended_embedding_models": ["gemini-embedding-2", "nomic-embed-text"],
        "embedding_dimensions": [768, 1536, 3072],
    },
    "claude_code_cli": {
        "ecosystem": "anthropic",
        "ecosystem_label": "Anthropic Claude Code CLI (claude)",
        "capabilities": ["Ejecución One-Shot (claude -p)", "Lectura Automática de CLAUDE.md y AGENTS.md", "Cliente MCP"],
        "recommended_models": ["claude-sonnet-4-5", "claude-3-7-sonnet-latest", "claude-3-5-sonnet"],
        "embedding_provider": "voyage",
        "default_embedding_model": "voyage-code-4",
        "recommended_embedding_models": ["voyage-code-4", "voyage-4", "nomic-embed-text"],
        "embedding_dimensions": [1024, 768],
    },
    "open_code_cli": {
        "ecosystem": "open_source_cli",
        "ecosystem_label": "OpenCode v2 Agent CLI (opencode)",
        "capabilities": ["Ejecución (opencode run --model)", "Auto-descubrimiento Ollama/LM Studio/vLLM", "Multi-Provider Router"],
        "recommended_models": [
            "anthropic/claude-sonnet-4-5",
            "openai/gpt-5.2",
            "ollama/gemma3:4b",
            "lmstudio/google/gemma-4-26b-a4b",
            "vllm/Qwen/Qwen3-Coder-30B-A3B-Instruct",
        ],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text", "text-embedding-3-small"],
        "embedding_dimensions": [768],
    },
    "codex_cli": {
        "ecosystem": "openai",
        "ecosystem_label": "OpenAI Codex / Platform CLI (codex / openai)",
        "capabilities": ["Agente de Terminal Codex", "OpenAI API CLI"],
        "recommended_models": ["gpt-5.4", "gpt-4o", "codex-mini-latest"],
        "embedding_provider": "openai",
        "default_embedding_model": "text-embedding-3-small",
        "recommended_embedding_models": ["text-embedding-3-small", "text-embedding-3-large"],
        "embedding_dimensions": [1536, 3072],
    },
    "gemini_cli": {
        "ecosystem": "google",
        "ecosystem_label": "Google Gemini CLI (gemini)",
        "capabilities": ["Agente de Terminal Gemini", "Integración con GEMINI_API_KEY y MCP"],
        "recommended_models": ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-3.8-flash"],
        "embedding_provider": "gemini",
        "default_embedding_model": "gemini-embedding-2",
        "recommended_embedding_models": ["gemini-embedding-2", "gemini-embedding-001"],
        "embedding_dimensions": [768, 1536, 3072],
    },
    "aider_cli": {
        "ecosystem": "open_source_cli",
        "ecosystem_label": "Aider AI Pair Programmer (aider)",
        "capabilities": ["Edición Git asistida por IA", "Soporte Ollama / Claude / OpenAI / DeepSeek"],
        "recommended_models": ["qwen2.5-coder", "claude-3-5-sonnet", "gpt-4o", "deepseek/deepseek-chat"],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text"],
        "embedding_dimensions": [768],
    },
    "ollama_cli": {
        "ecosystem": "ollama",
        "ecosystem_label": "Ollama Terminal CLI Nativo (ollama)",
        "capabilities": ["Ejecución directa por subproceso (ollama run)", "100% Air-Gapped"],
        "recommended_models": ["llama3.1:8b", "qwen2.5-coder:7b", "gemma3:4b"],
        "embedding_provider": "ollama",
        "default_embedding_model": "nomic-embed-text",
        "recommended_embedding_models": ["nomic-embed-text", "mxbai-embed-large"],
        "embedding_dimensions": [768, 1024],
    },
}


def infer_engine_type(provider: LLMProvider) -> EngineType:
    """Infer default EngineType from LLMProvider."""
    if provider in {
        LLMProvider.CLAUDE_CODE_CLI,
        LLMProvider.OPEN_CODE_CLI,
        LLMProvider.ANTIGRAVITY_CLI,
        LLMProvider.CODEX_CLI,
        LLMProvider.GEMINI_CLI,
        LLMProvider.AIDER_CLI,
        LLMProvider.OLLAMA_CLI,
    }:
        return EngineType.LOCAL_CLI
    if provider in {
        LLMProvider.OLLAMA,
        LLMProvider.OLLAMA_HTTP,
        LLMProvider.LM_STUDIO,
        LLMProvider.VLLM,
        LLMProvider.LOCALAI,
    }:
        return EngineType.LOCAL_HTTP
    return EngineType.CLOUD_API


def is_masked_api_key(value: str | None) -> bool:
    """Check whether an API key string is empty or contains UI masking characters."""
    if not value:
        return True
    stripped = value.strip()
    if not stripped:
        return True
    return "•" in stripped or stripped.startswith("****") or "••••" in stripped


def sanitize_api_key(value: str | None) -> str:
    """Sanitize API key to pure printable ASCII so HTTP headers never fail with UnicodeEncodeError."""
    if not value:
        return ""
    if is_masked_api_key(value):
        return ""
    ascii_only = value.encode("ascii", errors="ignore").decode("ascii").strip()
    return ascii_only


@dataclass
class LLMConfiguration(Entity):
    """Configuration record for a specific LLM Provider or Local CLI Agent."""

    provider: LLMProvider = LLMProvider.OLLAMA
    engine_type: EngineType = EngineType.LOCAL_HTTP
    name: str = "Ollama Local"
    api_key: str = ""
    base_url: str = "http://localhost:11434"
    default_model: str = "llama3.1:8b"
    cli_command: str = ""
    cli_args: str = ""
    is_active: bool = False
    temperature: float = 0.2
    max_tokens: int = 4096
    additional_params: dict[str, Any] = field(default_factory=dict)
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        if isinstance(self.provider, str):
            self.provider = LLMProvider(self.provider)
        if isinstance(self.engine_type, str):
            try:
                self.engine_type = EngineType(self.engine_type)
            except ValueError:
                self.engine_type = infer_engine_type(self.provider)

    @property
    def model_name(self) -> str:
        """Alias for default_model used by Universal LLM Engine specifications."""
        return self.default_model

    def mask_api_key(self) -> str:
        """Return securely masked API key for safe presentation in UI."""
        if not self.api_key:
            return ""
        if len(self.api_key) <= 8:
            return "••••••••"
        return f"{self.api_key[:4]}••••••••{self.api_key[-4:]}"

    def to_dict(self, mask_key: bool = True) -> dict[str, Any]:
        """Serialize configuration for API responses and client presentation."""
        meta = PROVIDER_ECOSYSTEM_CATALOG.get(self.provider.value, {})
        embedding_model = self.additional_params.get(
            "embedding_model",
            meta.get("default_embedding_model", "nomic-embed-text"),
        )
        embedding_dim = int(
            self.additional_params.get(
                "embedding_dimensions",
                (meta.get("embedding_dimensions") or [768])[0],
            )
        )
        return {
            "id": self.id or self.provider.value,
            "provider": self.provider.value,
            "engine_type": self.engine_type.value,
            "name": self.name,
            "api_key": self.mask_api_key() if mask_key else self.api_key,
            "has_api_key": bool(self.api_key and not is_masked_api_key(self.api_key)),
            "base_url": self.base_url,
            "default_model": self.default_model,
            "model_name": self.default_model,
            "cli_command": self.cli_command,
            "cli_args": self.cli_args,
            "is_active": self.is_active,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "ecosystem": meta.get("ecosystem", "custom"),
            "ecosystem_label": meta.get("ecosystem_label", self.name),
            "capabilities": meta.get("capabilities", []),
            "recommended_models": meta.get("recommended_models", [self.default_model]),
            "embedding_provider": self.additional_params.get(
                "embedding_provider",
                meta.get("embedding_provider", "ollama"),
            ),
            "embedding_model": embedding_model,
            "recommended_embedding_models": meta.get(
                "recommended_embedding_models",
                ["nomic-embed-text"],
            ),
            "embedding_dimensions": embedding_dim,
            "supported_embedding_dimensions": meta.get("embedding_dimensions", [768]),
            "additional_params": self.additional_params,
            "updated_at": self.updated_at.isoformat(),
        }
