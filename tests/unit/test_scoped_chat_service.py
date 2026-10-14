"""Unit tests for ScopedChatService (Zero-RAG Bypass and Scoped Search)."""

from __future__ import annotations

from unittest.mock import AsyncMock
import pytest

from application.chat.services import ScopedChatService


@pytest.mark.asyncio
async def test_scoped_chat_zero_rag_bypass() -> None:
    mock_vector = AsyncMock()
    mock_ollama = AsyncMock()
    mock_ollama.generate.return_value = "La política exige 3 reintentos con backoff exponencial."

    service = ScopedChatService(vector_store=mock_vector, ollama_client=mock_ollama)

    doc_text = "# Política de Reintentos\n\nEl servicio debe reintentar hasta 3 veces."
    result = await service.answer_question(
        library_id="iuristrack",
        book_id="retry-policy.md",
        raw_markdown=doc_text,
        user_query="¿Cuántos reintentos se permiten?",
    )

    # In Zero-RAG Bypass (doc <= 32k), vector search is NOT called
    mock_vector.search_scoped.assert_not_called()
    mock_ollama.generate.assert_awaited_once()

    assert "3 reintentos" in result["answer"]
    assert len(result["sources"]) == 1
    assert result["sources"][0]["location"] == "Documento Completo"
    assert result["sources"][0]["document_path"] == "retry-policy.md"


@pytest.mark.asyncio
async def test_scoped_chat_scoped_rag_large_document() -> None:
    mock_vector = AsyncMock()
    mock_ollama = AsyncMock()
    mock_ollama.generate.return_value = "Según la página 4 del manual, la clave expira en 24h."

    # Return mock scoped chunks
    mock_vector.search_scoped.return_value = [
        {
            "text": "La clave API expira exactamente en 24 horas tras emisión.",
            "metadata": {
                "file_path": "auth/token.md",
                "attachment_name": "manual_seguridad.pdf",
                "location": "Pág. 4",
            },
        }
    ]

    service = ScopedChatService(vector_store=mock_vector, ollama_client=mock_ollama)

    # Large markdown exceeding 32k characters
    large_doc = "X" * 33000

    result = await service.answer_question(
        library_id="iuristrack",
        book_id="auth/token.md",
        raw_markdown=large_doc,
        user_query="¿Cuánto dura la clave API?",
    )

    # Scoped Chroma search MUST be called
    mock_vector.search_scoped.assert_awaited_once_with(
        library_id="iuristrack",
        book_id="auth/token.md",
        query="¿Cuánto dura la clave API?",
        limit=5,
    )

    assert "página 4" in result["answer"]
    assert len(result["sources"]) == 1
    assert result["sources"][0]["attachment_name"] == "manual_seguridad.pdf"
    assert result["sources"][0]["location"] == "Pág. 4"


@pytest.mark.asyncio
async def test_scoped_chat_empty_chunks_fallback() -> None:
    mock_vector = AsyncMock()
    mock_ollama = AsyncMock()
    mock_vector.search_scoped.return_value = []

    service = ScopedChatService(vector_store=mock_vector, ollama_client=mock_ollama)

    # Empty markdown forces vector lookup
    result = await service.answer_question(
        library_id="default",
        book_id="unknown.md",
        raw_markdown="",
        user_query="¿Cuál es la regla?",
    )

    assert "no contiene esa información" in result["answer"]
    assert result["sources"] == []

