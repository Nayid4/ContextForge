"""Unit tests for Book Registry domain entities and Bidirectional Markdown Parser."""

from __future__ import annotations

from domain.book_registry.entities import (
    Attachment,
    AttachmentBlock,
    BlockType,
    CodeBlock,
    DocumentBlock,
    DraftBook,
    HeadingBlock,
    MermaidBlock,
    ParagraphBlock,
)
from infrastructure.external.markdown_parser import MarkdownParser


def test_block_types_and_entity_dicts() -> None:
    assert BlockType.HEADING.value == "heading"
    assert BlockType.PARAGRAPH.value == "paragraph"
    assert BlockType.CODE.value == "code"
    assert BlockType.MERMAID.value == "mermaid"
    assert BlockType.ATTACHMENT.value == "attachment"

    h = HeadingBlock(level=2, text="Arquitectura de Pagos")
    assert h.to_dict() == {"type": "heading", "level": 2, "text": "Arquitectura de Pagos"}

    p = ParagraphBlock(text="Regla de idempotencia.")
    assert p.to_dict() == {"type": "paragraph", "text": "Regla de idempotencia."}

    c = CodeBlock(language="python", code="def pay(): pass")
    assert c.to_dict() == {"type": "code", "language": "python", "code": "def pay(): pass"}

    m = MermaidBlock(code="graph TD; A-->B;")
    assert m.to_dict() == {"type": "mermaid", "code": "graph TD; A-->B;"}

    att = AttachmentBlock(
        file_name="diagram.png",
        file_path="assets/doc/diagram.png",
        mime_type="image/png",
        is_image=True,
        caption="Diagrama de Red",
    )
    assert att.to_dict() == {
        "type": "attachment",
        "file_name": "diagram.png",
        "file_path": "assets/doc/diagram.png",
        "mime_type": "image/png",
        "is_image": True,
        "caption": "Diagrama de Red",
    }

    attachment_entity = Attachment(
        id="att-1",
        book_id="doc-1",
        file_name="manual.pdf",
        file_path="assets/doc-1/manual.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
    )
    assert attachment_entity.to_dict()["id"] == "att-1"
    assert attachment_entity.to_dict()["size_bytes"] == 1024

    draft = DraftBook(
        id="draft-1",
        library_id="core",
        module="billing",
        title="Cobros",
        description="Módulo de cobros",
        tags=["fintech"],
        raw_markdown="# Cobros",
    )
    assert draft.title == "Cobros"
    assert len(draft.attachments) == 0


def test_markdown_parser_blocks_to_markdown() -> None:
    blocks: list[DocumentBlock] = [
        HeadingBlock(level=1, text="Especificación de Cobros"),
        ParagraphBlock(text="Este módulo maneja las pasarelas de pago."),
        CodeBlock(language="python", code="def cobrar():\n    return True"),
        MermaidBlock(code="sequenceDiagram\n  A->>B: Petición"),
        AttachmentBlock(
            file_name="diagrama.png",
            file_path="assets/cobros/diagrama.png",
            mime_type="image/png",
            is_image=True,
            caption="Diagrama de Secuencia",
        ),
        AttachmentBlock(
            file_name="manual.pdf",
            file_path="assets/cobros/manual.pdf",
            mime_type="application/pdf",
            is_image=False,
            caption="Manual de Operación",
        ),
    ]

    compiled_md = MarkdownParser.blocks_to_markdown(
        title="Especificación de Cobros",
        module="billing",
        library_id="core-banking",
        tags=["pagos", "seguridad"],
        description="Documento técnico de pagos",
        blocks=blocks,
    )

    assert "title: Especificación de Cobros" in compiled_md
    assert "library_id: core-banking" in compiled_md
    assert "# Especificación de Cobros" in compiled_md
    assert "Este módulo maneja las pasarelas de pago." in compiled_md
    assert "```python" in compiled_md
    assert "```mermaid" in compiled_md
    assert "![Diagrama de Secuencia](assets/cobros/diagrama.png)" in compiled_md
    assert "> 📎 **Anexo:** [Manual de Operación](assets/cobros/manual.pdf)" in compiled_md


def test_markdown_parser_markdown_to_blocks_roundtrip() -> None:
    source_md = """---
title: Arquitectura de Datos
module: data
library_id: analytics
tags:
- spark
- bigquery
description: Pipeline de analítica
---

# Título Principal

Texto de introducción sobre el pipeline.

## 1. Topología del Sistema

```mermaid
graph TD
  A[GCS] --> B[Dataflow]
```

```python
def process():
    print("running")
```

![Topología](assets/data/topologia.png)

> 📎 **Anexo:** [Manual Técnico](assets/data/manual.pdf)
"""

    meta, blocks = MarkdownParser.markdown_to_blocks(source_md)

    assert meta["title"] == "Arquitectura de Datos"
    assert meta["module"] == "data"
    assert meta["library_id"] == "analytics"
    assert "spark" in meta["tags"]

    assert any(isinstance(b, HeadingBlock) and b.text == "Título Principal" and b.level == 1 for b in blocks)
    assert any(isinstance(b, ParagraphBlock) and "Texto de introducción" in b.text for b in blocks)
    assert any(isinstance(b, HeadingBlock) and b.text == "1. Topología del Sistema" and b.level == 2 for b in blocks)
    assert any(isinstance(b, MermaidBlock) and "graph TD" in b.code for b in blocks)
    assert any(isinstance(b, CodeBlock) and b.language == "python" for b in blocks)
    assert any(isinstance(b, AttachmentBlock) and b.is_image is True for b in blocks)
    assert any(isinstance(b, AttachmentBlock) and b.is_image is False for b in blocks)

