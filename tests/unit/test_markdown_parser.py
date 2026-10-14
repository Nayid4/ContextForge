"""Unit tests for MarkdownParserService."""

from infrastructure.external.markdown_parser import MarkdownParserService


def test_markdown_render_html() -> None:
    parser = MarkdownParserService()
    raw = "# Encabezado Principal\n\nEste es un párrafo con **negrita**."
    result = parser.render(raw)

    assert "<h1>" in result.html_content
    assert "Encabezado Principal" in result.html_content
    assert "<strong>negrita</strong>" in result.html_content
    assert result.word_count > 0
    assert result.reading_time_minutes >= 1


def test_markdown_render_empty() -> None:
    parser = MarkdownParserService()
    result = parser.render("   ")
    assert "Sin contenido para previsualizar" in result.html_content
    assert result.word_count == 0
    assert result.reading_time_minutes == 0

