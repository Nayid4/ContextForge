"""External LLM Client adapters and Factory."""

from infrastructure.external.llm.anthropic_client import AnthropicHttpClient
from infrastructure.external.llm.cli_process_client import CLIProcessClient
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.llm_factory import LLMFactory
from infrastructure.external.llm.llm_strategies import (
    EmbeddingOptions,
    IEmbeddingStrategy,
    ILLMClientStrategy,
    LLMOptions,
)
from infrastructure.external.llm.openai_client import OpenAIHttpClient

__all__ = [
    "AnthropicHttpClient",
    "CLIProcessClient",
    "EmbeddingOptions",
    "GeminiHttpClient",
    "IEmbeddingStrategy",
    "ILLMClientStrategy",
    "LLMFactory",
    "LLMOptions",
    "OpenAIHttpClient",
]
