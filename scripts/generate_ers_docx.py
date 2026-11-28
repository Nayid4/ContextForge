"""Generates the institutional academic Word document (.docx) for ContextForge ERS.

Enforces strict typographic and layout standards:
- Paper size: Letter (21.59 cm x 27.94 cm / 8.5" x 11")
- Margins: 2.54 cm (1 inch) on Top, Bottom, Left, Right
- Font: Times New Roman 12 pt globally (headings 12-14 pt bold, table cells 10 pt Times New Roman)
- Line spacing: 1.5 lines on narrative paragraphs
- Indentation: 1.27 cm (0.5 inch) first-line indent on narrative body paragraphs
  (0 cm on headings, tables, block quotes, lists, captions; hanging indent 1.27 cm on APA 7th references)
- Alignment: Justified on narrative body; Left-aligned inside tables
- Tables: Shaded header (#1B365D) with bold white text, subtle borders, cantSplit on all rows, tblHeader repeat
- Diagrams: Embedded high-DPI PNGs centered (width 16.0 cm <= 16.5 cm) with numbered academic captions
"""

from __future__ import annotations

from pathlib import Path
import re

import docx
from docx.document import Document as DocxDocument
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
ERS_DIR = ROOT / "docs" / "ers"
DIAG_DIR = ROOT / "docs" / "diagramas"
OUT_DOCX = ROOT / "docs" / "entregables" / "ERS_Proyecto_Ingenieria_Software.docx"

MODULE_FILES = [
    "01_introduccion_y_marco_metodologico.md",
    "02_analisis_problema_elicitacion_stakeholders_reingenieria.md",
    "03_casos_de_uso_y_requerimientos_funcionales.md",
    "04_requerimientos_no_funcionales_interfaces_y_otros.md",
    "05_modelado_agil_spidr_hu_scrum_xp.md",
    "06_arquitectura_trazabilidad_validacion_glosario_referencias.md",
]

NAVY_HEX = "1B365D"
ZEBRA_HEX = "F8FAFC"
BORDER_HEX = "CBD5E1"
NAVY_RGB = RGBColor(0x1B, 0x36, 0x5D)
BLACK_RGB = RGBColor(0x00, 0x00, 0x00)
DARK_SLATE_RGB = RGBColor(0x1E, 0x29, 0x3B)
WHITE_RGB = RGBColor(0xFF, 0xFF, 0xFF)


def _apply_times_rfonts(rPr: OxmlElement) -> None:
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), "Times New Roman")
    for theme_attr in ("w:asciiTheme", "w:hAnsiTheme", "w:cstheme", "w:eastAsiaTheme"):
        if qn(theme_attr) in rFonts.attrib:
            del rFonts.attrib[qn(theme_attr)]


def format_run(
    run: docx.text.run.Run,
    size_pt: float = 12.0,
    bold: bool = False,
    italic: bool = False,
    color: RGBColor = BLACK_RGB,
) -> None:
    run.font.name = "Times New Roman"
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    _apply_times_rfonts(rPr)


def clean_latex_and_entities(text: str) -> str:
    replacements = [
        (r"$\le$", "≤"),
        (r"$\ge$", "≥"),
        (r"\le", "≤"),
        (r"\ge", "≥"),
        (r"$\rightarrow$", "→"),
        (r"\rightarrow", "→"),
        (r"$\leftrightarrow$", "↔"),
        (r"$\times$", "×"),
        (r"\times", "×"),
        (r"\text{RRF}(d) = \sum_{r \in R} \frac{1}{k + \text{rank}_r(d)}", "RRF(d) = ∑ [1 / (k + rank_r(d))]"),
        (r"\alpha + \beta = 1.0", "α + β = 1.0"),
        (r"\max(top\_k \times 2, 10)", "máx(top_k × 2, 10)"),
        (r"1 \le \text{score} \le 5", "1 ≤ score ≤ 5"),
        (r"0.0 \le T \le 2.0", "0.0 ≤ T ≤ 2.0"),
        (r"64 \le M \le 32768", "64 ≤ M ≤ 32768"),
        (r"500\,000", "500 000"),
        (r"1\,200", "1 200"),
        (r"\text{ min}", " min"),
        (r"\text{ días}", " días"),
        (r"\text{ ms}", " ms"),
        (r"\text{ MB}", " MB"),
        (r"\text{ GHz}", " GHz"),
        (r"\text{ SP}", " SP"),
        (r"\text{–}", "–"),
        (r"\%", "%"),
        ("&amp;", "&"),
        ("&lt;", "<"),
        ("&gt;", ">"),
        ("&nbsp;", " "),
    ]
    out = text
    for old, new in replacements:
        out = out.replace(old, new)
    # Strip remaining inline math dollar signs cleanly
    out = re.sub(r"\$([^$]+)\$", r"\1", out)
    # Convert markdown links [label](url) -> label
    out = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", out)
    return out


TOKEN_PATTERN = re.compile(
    r"(\*{4,}|`[^`]+`|\*\*\*(?:`[^`]+`|[^*])+\*\*\*|\*\*(?:`[^`]+`|[^*])+\*\*|\*(?:`[^`]+`|[^*])+\*)"
)


def _strip_backticks(s: str) -> str:
    return s.replace("`", "")


def append_rich_text(
    paragraph: docx.text.paragraph.Paragraph,
    raw_text: str,
    size_pt: float = 12.0,
    base_bold: bool = False,
    base_italic: bool = False,
    color: RGBColor = BLACK_RGB,
) -> None:
    cleaned = clean_latex_and_entities(raw_text)
    segments = re.split(r"<br\s*/?>", cleaned, flags=re.IGNORECASE)
    for seg_idx, segment in enumerate(segments):
        if seg_idx > 0:
            br_run = paragraph.add_run()
            br_run.add_break()
            format_run(br_run, size_pt=size_pt, color=color)
        pos = 0
        for match in TOKEN_PATTERN.finditer(segment):
            if match.start() > pos:
                plain = segment[pos : match.start()]
                r = paragraph.add_run(plain)
                format_run(r, size_pt=size_pt, bold=base_bold, italic=base_italic, color=color)
            tok = match.group(0)
            if tok.startswith("****"):
                r = paragraph.add_run(tok)
                format_run(r, size_pt=size_pt, bold=base_bold, italic=base_italic, color=DARK_SLATE_RGB)
            elif tok.startswith("`") and tok.endswith("`"):
                r = paragraph.add_run(tok[1:-1])
                format_run(r, size_pt=size_pt, bold=base_bold, italic=base_italic, color=DARK_SLATE_RGB)
            elif tok.startswith("***") and tok.endswith("***"):
                r = paragraph.add_run(_strip_backticks(tok[3:-3]))
                format_run(r, size_pt=size_pt, bold=True, italic=True, color=color)
            elif tok.startswith("**") and tok.endswith("**"):
                r = paragraph.add_run(_strip_backticks(tok[2:-2]))
                format_run(r, size_pt=size_pt, bold=True, italic=base_italic, color=color)
            elif tok.startswith("*") and tok.endswith("*"):
                r = paragraph.add_run(_strip_backticks(tok[1:-1]))
                format_run(r, size_pt=size_pt, bold=base_bold, italic=True, color=color)
            pos = match.end()
        if pos < len(segment):
            r = paragraph.add_run(segment[pos:])
            format_run(r, size_pt=size_pt, bold=base_bold, italic=base_italic, color=color)


def configure_document_styles(doc: DocxDocument) -> None:
    for section in doc.sections:
        section.page_width = Cm(21.59)
        section.page_height = Cm(27.94)
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(2.54)
        section.right_margin = Cm(2.54)
        section.different_first_page_header_footer = True

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(12)
    normal.font.color.rgb = BLACK_RGB
    _apply_times_rfonts(normal.element.get_or_add_rPr())
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.first_line_indent = Cm(1.27)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)

    heading_specs = {
        "Heading 1": (14.0, NAVY_RGB, Pt(16), Pt(8)),
        "Heading 2": (13.0, NAVY_RGB, Pt(13), Pt(6)),
        "Heading 3": (12.0, DARK_SLATE_RGB, Pt(10), Pt(4)),
        "Heading 4": (12.0, BLACK_RGB, Pt(8), Pt(3)),
    }
    for style_name, (fsize, col, sp_before, sp_after) in heading_specs.items():
        st = doc.styles[style_name]
        st.font.name = "Times New Roman"
        st.font.size = Pt(fsize)
        st.font.bold = True
        st.font.italic = style_name == "Heading 4"
        st.font.color.rgb = col
        _apply_times_rfonts(st.element.get_or_add_rPr())
        st.paragraph_format.first_line_indent = Cm(0)
        st.paragraph_format.left_indent = Cm(0)
        st.paragraph_format.line_spacing = 1.5
        st.paragraph_format.space_before = sp_before
        st.paragraph_format.space_after = sp_after
        st.paragraph_format.keep_with_next = True
        st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT


def add_header_and_footer(doc: DocxDocument) -> None:
    section = doc.sections[0]
    header = section.header
    hp = header.paragraphs[0]
    hp.paragraph_format.first_line_indent = Cm(0)
    hp.paragraph_format.line_spacing = 1.15
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r1 = hp.add_run("Especificación de Requisitos de Software (ERS) — ContextForge v2.0   |   Pág. ")
    format_run(r1, size_pt=10.0, italic=True, color=DARK_SLATE_RGB)

    # Native Word PAGE field
    fldSimple = OxmlElement("w:fldSimple")
    fldSimple.set(qn("w:instr"), "PAGE")
    hp._p.append(fldSimple)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.paragraph_format.first_line_indent = Cm(0)
    fp.paragraph_format.line_spacing = 1.15
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rf = fp.add_run(
        "Universidad Popular del Cesar — Especialización en Ingeniería de Software — Módulo: Ingeniería de Requerimientos (2026)"
    )
    format_run(rf, size_pt=9.5, color=DARK_SLATE_RGB)


def add_centered_cover_line(
    doc: DocxDocument,
    text: str,
    size_pt: float = 12.0,
    bold: bool = False,
    italic: bool = False,
    space_before: float = 0.0,
    space_after: float = 6.0,
    color: RGBColor = BLACK_RGB,
) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text)
    format_run(r, size_pt=size_pt, bold=bold, italic=italic, color=color)


def build_cover_page(doc: DocxDocument) -> None:
    add_centered_cover_line(
        doc,
        "ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (ERS) Y PROPUESTA DE REINGENIERÍA FUNCIONAL DEL SISTEMA Y COMPONENTE REUTILIZABLE CONTEXTFORGE",
        size_pt=14.0,
        bold=True,
        space_before=18,
        space_after=12,
        color=NAVY_RGB,
    )
    add_centered_cover_line(
        doc,
        "Plataforma Soberana de Gestión Documental Docs-as-Code, Búsqueda Híbrida (BM25 + Vectorial), Generación Aumentada por Recuperación (RAG) con Citas, Compilación de Context Bundles e Integración MCP / SDK Python",
        size_pt=12.0,
        italic=True,
        space_after=48,
    )

    add_centered_cover_line(doc, "Presentado por:", size_pt=12.0, space_before=24, space_after=4)
    add_centered_cover_line(doc, "KATHY CAROLINA SAGBINI DAZA", size_pt=12.0, bold=True, space_after=2)
    add_centered_cover_line(doc, "NAYID JUNIOR CASTELLAR AGAMEZ", size_pt=12.0, bold=True, space_after=42)

    add_centered_cover_line(doc, "Docente Titular:", size_pt=12.0, space_before=18, space_after=4)
    add_centered_cover_line(doc, "ESP. / MSC. MARIBEL ROMERO MESTRE", size_pt=12.0, bold=True, space_after=54)

    add_centered_cover_line(doc, "UNIVERSIDAD POPULAR DEL CESAR", size_pt=12.0, bold=True, space_before=30, space_after=3)
    add_centered_cover_line(doc, "FACULTAD DE INGENIERÍAS Y TECNOLÓGICAS", size_pt=12.0, bold=True, space_after=3)
    add_centered_cover_line(doc, "ESPECIALIZACIÓN EN INGENIERÍA DE SOFTWARE", size_pt=12.0, bold=True, space_after=3)
    add_centered_cover_line(doc, "MÓDULO: INGENIERÍA DE REQUERIMIENTOS", size_pt=12.0, bold=True, space_after=36)
    add_centered_cover_line(doc, "VALLEDUPAR, CESAR", size_pt=12.0, bold=True, space_after=2)
    add_centered_cover_line(doc, "2026", size_pt=12.0, bold=True, space_after=0)
    doc.add_page_break()


def add_toc_and_lists(doc: DocxDocument, headings: list[tuple[int, str]], figures: list[str], table_titles: list[str]) -> None:
    h_toc = doc.add_heading("TABLA DE CONTENIDO", level=1)
    h_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Insert native Word TOC field (auto-updatable with F9) + structured outline
    p_field = doc.add_paragraph()
    p_field.paragraph_format.first_line_indent = Cm(0)
    p_field.paragraph_format.line_spacing = 1.15
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = 'TOC \\o "1-3" \\h \\z \\u'
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "separate")
    fldChar3 = OxmlElement("w:fldChar")
    fldChar3.set(qn("w:fldCharType"), "end")
    r_fld = p_field.add_run()
    r_fld._r.append(fldChar1)
    r_fld._r.append(instrText)
    r_fld._r.append(fldChar2)
    r_fld._r.append(fldChar3)

    for lvl, title in headings:
        if lvl > 2:
            continue
        p = doc.add_paragraph()
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.left_indent = Cm((lvl - 1) * 0.75)
        p.paragraph_format.line_spacing = 1.35
        p.paragraph_format.space_after = Pt(2)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        append_rich_text(p, title, size_pt=12.0 if lvl == 1 else 11.5, base_bold=(lvl == 1))

    doc.add_paragraph().paragraph_format.first_line_indent = Cm(0)
    h_fig = doc.add_heading("LISTA DE FIGURAS", level=2)
    h_fig.paragraph_format.first_line_indent = Cm(0)
    for fig_caption in figures:
        pf = doc.add_paragraph()
        pf.paragraph_format.first_line_indent = Cm(0)
        pf.paragraph_format.line_spacing = 1.35
        pf.paragraph_format.space_after = Pt(3)
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
        append_rich_text(pf, f"• {fig_caption}", size_pt=11.5)

    h_tbl = doc.add_heading("LISTA DE TABLAS PRINCIPALES", level=2)
    h_tbl.paragraph_format.first_line_indent = Cm(0)
    for idx, t_title in enumerate(table_titles, start=1):
        pt = doc.add_paragraph()
        pt.paragraph_format.first_line_indent = Cm(0)
        pt.paragraph_format.line_spacing = 1.3
        pt.paragraph_format.space_after = Pt(2)
        pt.alignment = WD_ALIGN_PARAGRAPH.LEFT
        append_rich_text(pt, f"Tabla {idx}. {t_title}", size_pt=11.0)

    doc.add_page_break()


def _set_cell_background(cell: docx.table._Cell, hex_color: str) -> None:
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def _set_cell_margins(cell: docx.table._Cell, top: int = 80, bottom: int = 80, left: int = 110, right: int = 110) -> None:
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for side, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        node = OxmlElement(f"w:{side}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def _style_table_borders(table: docx.table.Table) -> None:
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{NAVY_HEX}"/>'
        f'<w:bottom w:val="single" w:sz="8" w:space="0" w:color="{NAVY_HEX}"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{BORDER_HEX}"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{BORDER_HEX}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{BORDER_HEX}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{BORDER_HEX}"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)


def _set_row_cant_split_and_header(row: docx.table._Row, is_header: bool = False) -> None:
    trPr = row._tr.get_or_add_trPr()
    trPr.append(OxmlElement("w:cantSplit"))
    if is_header:
        trPr.append(OxmlElement("w:tblHeader"))


def render_markdown_table(doc: DocxDocument, table_lines: list[str]) -> None:
    parsed_rows: list[list[str]] = []
    for line in table_lines:
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        # Skip separator row like | :--- | :---: |
        if all(re.fullmatch(r":?-+:?", c.replace(" ", "")) for c in cells if c != ""):
            continue
        parsed_rows.append(cells)

    if len(parsed_rows) < 2:
        return

    ncols = max(len(r) for r in parsed_rows)
    table = doc.add_table(rows=len(parsed_rows), cols=ncols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    _style_table_borders(table)

    # Choose 10 pt or 9.5 pt for very wide RTM/comparison tables so columns remain crisp
    cell_font_pt = 9.5 if ncols >= 7 else 10.5

    for r_idx, row_vals in enumerate(parsed_rows):
        row = table.rows[r_idx]
        is_hdr = r_idx == 0
        _set_row_cant_split_and_header(row, is_header=is_hdr)

        for c_idx in range(ncols):
            val = row_vals[c_idx] if c_idx < len(row_vals) else ""
            cell = row.cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            _set_cell_margins(cell)
            if is_hdr:
                _set_cell_background(cell, NAVY_HEX)
            elif r_idx % 2 == 0:
                _set_cell_background(cell, ZEBRA_HEX)

            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.left_indent = Cm(0)
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)

            append_rich_text(
                p,
                val,
                size_pt=10.5 if is_hdr else cell_font_pt,
                base_bold=is_hdr,
                color=WHITE_RGB if is_hdr else BLACK_RGB,
            )

    spacer = doc.add_paragraph()
    spacer.paragraph_format.first_line_indent = Cm(0)
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(4)


def embed_diagram_figure(doc: DocxDocument, alt_caption: str, rel_img_path: str) -> None:
    img_name = Path(rel_img_path).name
    img_path = DIAG_DIR / img_name
    if not img_path.exists():
        raise FileNotFoundError(f"Diagram PNG not found for embedding: {img_path}")

    # Academic title caption above figure (APA 7th / Institutional style)
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.first_line_indent = Cm(0)
    p_title.paragraph_format.line_spacing = 1.35
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(4)
    p_title.paragraph_format.keep_with_next = True
    append_rich_text(p_title, f"**{alt_caption}**", size_pt=11.5, color=NAVY_RGB)

    # Centered high-resolution image adjusted strictly <= 16.5 cm (16.0 cm)
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.first_line_indent = Cm(0)
    p_img.paragraph_format.space_before = Pt(2)
    p_img.paragraph_format.space_after = Pt(4)
    p_img.paragraph_format.keep_with_next = True
    run_img = p_img.add_run()
    run_img.add_picture(str(img_path), width=Cm(16.0))

    # Source note below figure
    p_note = doc.add_paragraph()
    p_note.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_note.paragraph_format.first_line_indent = Cm(0)
    p_note.paragraph_format.line_spacing = 1.25
    p_note.paragraph_format.space_before = Pt(0)
    p_note.paragraph_format.space_after = Pt(10)
    append_rich_text(
        p_note,
        "*Nota.* Elaboración propia a partir de la arquitectura y modelo de dominio de ContextForge (2026). Archivo fuente editable en `docs/diagramas/"
        + img_path.with_suffix(".drawio").name
        + "`.",
        size_pt=10.5,
        color=DARK_SLATE_RGB,
    )


def collect_document_metadata(markdown_blocks: list[str]) -> tuple[list[tuple[int, str]], list[str], list[str]]:
    headings: list[tuple[int, str]] = []
    figures: list[str] = []
    tables: list[str] = []
    last_heading = "Ficha de Control"

    for block in markdown_blocks:
        lines = block.splitlines()
        in_table = False
        for line in lines:
            s = line.strip()
            hm = re.match(r"^(#{1,4})\s+(.+)$", s)
            if hm:
                lvl = len(hm.group(1))
                title = clean_latex_and_entities(hm.group(2)).replace("**", "").replace("`", "")
                headings.append((lvl, title))
                last_heading = title
                in_table = False
                continue
            fm = re.match(r"^!\[([^\]]+)\]\(([^)]+)\)$", s)
            if fm:
                figures.append(clean_latex_and_entities(fm.group(1)))
                in_table = False
                continue
            if s.startswith("|"):
                if not in_table:
                    tables.append(last_heading)
                    in_table = True
            else:
                in_table = False

    return headings, figures, tables


def render_markdown_into_docx(doc: DocxDocument, md_text: str) -> None:
    lines = md_text.splitlines()
    i = 0
    in_references_section = False

    while i < len(lines):
        raw_line = lines[i]
        stripped = raw_line.strip()

        # Skip empty lines or horizontal rules
        if not stripped or re.fullmatch(r"-{3,}", stripped):
            i += 1
            continue

        # Skip standalone italic figure duplicate caption line right after ![Figura...] since embed_diagram_figure renders a formal caption + note
        if re.match(r"^\*Figura\s+\d+\..+\*$", stripped):
            i += 1
            continue

        # Image / Diagram marker ![Caption](path)
        img_match = re.match(r"^!\[([^\]]+)\]\(([^)]+)\)$", stripped)
        if img_match:
            embed_diagram_figure(doc, img_match.group(1), img_match.group(2))
            i += 1
            continue

        # Markdown Table block
        if stripped.startswith("|"):
            tbl_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                tbl_lines.append(lines[i])
                i += 1
            render_markdown_table(doc, tbl_lines)
            continue

        # Headings H1..H4
        h_match = re.match(r"^(#{1,4})\s+(.+)$", stripped)
        if h_match:
            lvl = len(h_match.group(1))
            h_text = h_match.group(2).strip()
            if lvl == 1 and doc.paragraphs:
                # Start major chapters cleanly on a new page (except right after TOC page break)
                prev_text = doc.paragraphs[-1].text.strip()
                if prev_text:
                    doc.add_page_break()
            in_references_section = "Referencias Bibliográficas" in h_text
            hp = doc.add_heading("", level=lvl)
            hp.paragraph_format.first_line_indent = Cm(0)
            hp.paragraph_format.left_indent = Cm(0)
            hp.paragraph_format.keep_with_next = True
            h_size = {1: 14.0, 2: 13.0, 3: 12.0, 4: 12.0}[lvl]
            h_col = NAVY_RGB if lvl in (1, 2) else (DARK_SLATE_RGB if lvl == 3 else BLACK_RGB)
            append_rich_text(hp, h_text, size_pt=h_size, base_bold=True, base_italic=(lvl == 4), color=h_col)
            i += 1
            continue

        # Block Quote (> ...)
        if stripped.startswith(">"):
            q_parts: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                q_parts.append(lines[i].strip().lstrip(">").strip())
                i += 1
            qp = doc.add_paragraph()
            qp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            qp.paragraph_format.left_indent = Cm(1.27)
            qp.paragraph_format.right_indent = Cm(0.6)
            qp.paragraph_format.first_line_indent = Cm(0)
            qp.paragraph_format.line_spacing = 1.5
            qp.paragraph_format.space_before = Pt(4)
            qp.paragraph_format.space_after = Pt(6)
            append_rich_text(qp, " ".join(q_parts), size_pt=12.0, base_italic=True, color=DARK_SLATE_RGB)
            continue

        # Bullet or Numbered List Item
        ul_match = re.match(r"^(\s*)([-*])\s+(.+)$", raw_line)
        ol_match = re.match(r"^(\s*)(\d+\.)\s+(.+)$", raw_line)
        if ul_match or ol_match:
            if ul_match:
                indent_spaces = len(ul_match.group(1))
                prefix = "• " if indent_spaces < 2 else "◦ "
                item_body = ul_match.group(3).strip()
            else:
                assert ol_match is not None
                indent_spaces = len(ol_match.group(1))
                prefix = f"{ol_match.group(2)} "
                item_body = ol_match.group(3).strip()

            lp = doc.add_paragraph()
            lp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            nesting_cm = 1.27 + (0.65 if indent_spaces >= 2 else 0.0)
            lp.paragraph_format.left_indent = Cm(nesting_cm)
            lp.paragraph_format.first_line_indent = Cm(-0.55)
            lp.paragraph_format.line_spacing = 1.5
            lp.paragraph_format.space_before = Pt(0)
            lp.paragraph_format.space_after = Pt(3)
            append_rich_text(lp, prefix + item_body, size_pt=12.0)
            i += 1
            continue

        # Standard Narrative Paragraph (or APA 7th Reference entry with hanging indent)
        para_lines: list[str] = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if (
                not nxt
                or nxt.startswith("#")
                or nxt.startswith("|")
                or nxt.startswith(">")
                or nxt.startswith("![")
                or re.fullmatch(r"-{3,}", nxt)
                or re.match(r"^(\s*)([-*]|\d+\.)\s+", lines[i])
            ):
                break
            para_lines.append(nxt)
            i += 1

        joined = " ".join(para_lines)
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.5
        if in_references_section:
            # APA 7th Hanging Indent (Sangría francesa 1.27 cm)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.left_indent = Cm(1.27)
            p.paragraph_format.first_line_indent = Cm(-1.27)
            p.paragraph_format.space_after = Pt(6)
        elif joined.startswith("**Ficha de Control Documental**"):
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.keep_with_next = True
            p.paragraph_format.space_after = Pt(4)
        else:
            # Strict institutional rule: 12 pt Times New Roman, 1.5 line spacing, 1.27 cm first-line indent, Justified
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.left_indent = Cm(0)
            p.paragraph_format.first_line_indent = Cm(1.27)
            p.paragraph_format.space_after = Pt(6)

        append_rich_text(p, joined, size_pt=12.0)


def generate_ers_docx() -> Path:
    OUT_DOCX.parent.mkdir(parents=True, exist_ok=True)
    md_modules = [(ERS_DIR / name).read_text(encoding="utf-8") for name in MODULE_FILES]

    doc = docx.Document()
    configure_document_styles(doc)
    add_header_and_footer(doc)
    build_cover_page(doc)

    headings, figures, table_titles = collect_document_metadata(md_modules)
    add_toc_and_lists(doc, headings, figures, table_titles)

    for idx, mod_text in enumerate(md_modules):
        if idx > 0:
            doc.add_page_break()
        render_markdown_into_docx(doc, mod_text)

    doc.save(str(OUT_DOCX))
    print(
        f"Generated {OUT_DOCX} ({OUT_DOCX.stat().st_size:,} bytes | "
        f"Paragraphs: {len(doc.paragraphs)} | Tables: {len(doc.tables)} | InlineShapes: {len(doc.inline_shapes)})"
    )
    return OUT_DOCX


if __name__ == "__main__":
    generate_ers_docx()
