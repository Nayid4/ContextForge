"""LLM Client and Embedding Strategies subpackage."""

from infrastructure.external.llm.strategies.anthropic import AnthropicLLMStrategy
from infrastructure.external.llm.strategies.cli import CliLLMStrategy
from infrastructure.external.llm.strategies.deepseek import DeepSeekLLMStrategy
from infrastructure.external.llm.strategies.embeddings import (
    AnthropicVoyageEmbeddingStrategy,
    GeminiEmbeddingStrategy,
    OllamaEmbeddingStrategy,
    OpenAICompatibleEmbeddingStrategy,
)
from infrastructure.external.llm.strategies.gemini import GeminiLLMStrategy
from infrastructure.external.llm.strategies.ollama import OllamaLLMStrategy
from infrastructure.external.llm.strategies.openai_cloud import OpenAICloudLLMStrategy
from infrastructure.external.llm.strategies.openai_compat import OpenAICompatibleLLMStrategy
from infrastructure.external.llm.strategies.options import EmbeddingOptions, LLMOptions
from infrastructure.external.llm.strategies.protocols import IEmbeddingStrategy, ILLMClientStrategy

__all__ = [
    "AnthropicLLMStrategy",
    "AnthropicVoyageEmbeddingStrategy",
    "CliLLMStrategy",
    "DeepSeekLLMStrategy",
    "EmbeddingOptions",
    "GeminiEmbeddingStrategy",
    "GeminiLLMStrategy",
    "IEmbeddingStrategy",
    "ILLMClientStrategy",
    "LLMOptions",
    "OllamaEmbeddingStrategy",
    "OllamaLLMStrategy",
    "OpenAICloudLLMStrategy",
    "OpenAICompatibleEmbeddingStrategy",
    "OpenAICompatibleLLMStrategy",
]

