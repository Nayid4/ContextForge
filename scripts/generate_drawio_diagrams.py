"""Generates 6 native editable Draw.io (.drawio) XML diagrams and high-DPI (.png) exports for ContextForge ERS."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "diagramas"

# Institutional sober palette
NAVY = "#1B365D"
NAVY_LIGHT = "#EFF6FF"
TEAL = "#0F766E"
TEAL_LIGHT = "#F0FDFA"
SLATE = "#334155"
SLATE_LIGHT = "#F8FAFC"
AMBER = "#B45309"
AMBER_LIGHT = "#FFFBEB"
INDIGO = "#3730A3"
INDIGO_LIGHT = "#EEF2FF"
PURPLE = "#6B21A8"
PURPLE_LIGHT = "#FAF5FF"
BORDER_GRAY = "#94A3B8"
TEXT_DARK = "#0F172A"
WHITE = "#FFFFFF"


def _load_font(size: int, bold: bool = False, italic: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    win_fonts = Path("C:/Windows/Fonts")
    candidates: list[str] = []
    if mono:
        candidates = ["consolab.ttf" if bold else "consola.ttf", "courbd.ttf" if bold else "cour.ttf"]
    elif bold and italic:
        candidates = ["segoeuiz.ttf", "arialbi.ttf", "timesbi.ttf"]
    elif bold:
        candidates = ["segoeuib.ttf", "arialbd.ttf", "timesbd.ttf"]
    elif italic:
        candidates = ["segoeuii.ttf", "ariali.ttf", "timesi.ttf"]
    else:
        candidates = ["segoeui.ttf", "arial.ttf", "times.ttf"]
    for name in candidates:
        fp = win_fonts / name
        if fp.exists():
            try:
                return ImageFont.truetype(str(fp), size=size)
            except Exception:
                continue
    return ImageFont.load_default()


class DrawioBuilder:
    """Builds valid Draw.io mxGraphModel XML and renders deterministic high-DPI PNG directly from the model."""

    def __init__(self, diagram_id: str, name: str, width: int, height: int) -> None:
        self.diagram_id = diagram_id
        self.name = name
        self.width = width
        self.height = height
        self._next_id = 2
        self.nodes: dict[str, dict[str, Any]] = {}
        self.edges: list[dict[str, Any]] = []

    def _new_id(self, prefix: str = "c") -> str:
        cid = f"{prefix}_{self._next_id}"
        self._next_id += 1
        return cid

    def add_banner(self, title: str, subtitle: str) -> str:
        return self.add_box(
            x=30,
            y=20,
            w=self.width - 60,
            h=64,
            label=f"<b>{title}</b><br>{subtitle}",
            fill=NAVY,
            stroke="#0F172A",
            font_color=WHITE,
            rounded=True,
            font_size=15,
            kind="banner",
            raw_lines=[(title, True, 17), (subtitle, False, 12)],
        )

    def add_container(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        title: str,
        fill: str = "#F8FAFC",
        stroke: str = NAVY,
        header_fill: str = "#E2E8F0",
        header_text: str = TEXT_DARK,
        dashed: bool = True,
    ) -> str:
        cid = self._new_id("grp")
        style = (
            f"swimlane;whiteSpace=wrap;html=1;startSize=32;fillColor={header_fill};"
            f"swimlaneFillColor={fill};strokeColor={stroke};fontColor={header_text};"
            f"fontStyle=1;fontSize=13;rounded=1;arcSize=4;strokeWidth=2;"
            + ("dashed=1;dashPattern=8 6;" if dashed else "")
        )
        self.nodes[cid] = {
            "id": cid,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "label": title,
            "style": style,
            "fill": fill,
            "stroke": stroke,
            "header_fill": header_fill,
            "font_color": header_text,
            "dashed": dashed,
            "kind": "container",
            "z": 1,
        }
        return cid

    def add_box(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        label: str,
        fill: str = WHITE,
        stroke: str = NAVY,
        font_color: str = TEXT_DARK,
        rounded: bool = True,
        dashed: bool = False,
        font_size: int = 12,
        shape: str = "rect",
        kind: str = "box",
        raw_lines: list[tuple[str, bool, int]] | None = None,
        align: str = "center",
        header_band: str | None = None,
        header_title: str | None = None,
    ) -> str:
        cid = self._new_id("n")
        base_shape = "ellipse;" if shape == "ellipse" else ("shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=10;" if shape == "cylinder" else "")
        style = (
            f"{base_shape}whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};"
            f"fontColor={font_color};fontSize={font_size};strokeWidth=1.8;align={align};spacing=8;"
            + ("rounded=1;arcSize=8;" if rounded and shape == "rect" else "")
            + ("dashed=1;dashPattern=6 4;" if dashed else "")
        )
        self.nodes[cid] = {
            "id": cid,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "label": label,
            "style": style,
            "fill": fill,
            "stroke": stroke,
            "font_color": font_color,
            "rounded": rounded,
            "dashed": dashed,
            "font_size": font_size,
            "shape": shape,
            "kind": kind,
            "raw_lines": raw_lines,
            "align": align,
            "header_band": header_band,
            "header_title": header_title,
            "z": 10 if kind != "banner" else 5,
        }
        return cid

    def add_actor(self, x: int, y: int, w: int, h: int, name: str, role_tag: str, stroke: str = NAVY) -> str:
        cid = self._new_id("act")
        label = f"<b>{name}</b><br><i>{role_tag}</i>"
        style = (
            f"shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
            f"outlineConnect=0;fillColor={NAVY_LIGHT};strokeColor={stroke};fontColor={TEXT_DARK};fontSize=12;"
        )
        self.nodes[cid] = {
            "id": cid,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "label": label,
            "name": name,
            "role_tag": role_tag,
            "style": style,
            "fill": NAVY_LIGHT,
            "stroke": stroke,
            "font_color": TEXT_DARK,
            "kind": "actor",
            "z": 12,
        }
        return cid

    def add_uml_class(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        stereotype: str,
        title: str,
        attrs: list[str],
        methods: list[str],
        header_fill: str = NAVY,
        body_fill: str = WHITE,
    ) -> str:
        attr_html = "<br>".join(attrs) if attrs else "—"
        meth_html = "<br>".join(methods) if methods else "—"
        html_label = (
            f"<b>&lt;&lt;{stereotype}&gt;&gt;<br>{title}</b><hr>"
            f"{attr_html}<hr>{meth_html}"
        )
        cid = self.add_box(
            x=x,
            y=y,
            w=w,
            h=h,
            label=html_label,
            fill=body_fill,
            stroke=header_fill,
            font_color=TEXT_DARK,
            rounded=False,
            font_size=11,
            kind="uml_class",
            align="left",
            header_band=header_fill,
            header_title=f"<<{stereotype}>>\n{title}",
        )
        self.nodes[cid]["attrs"] = attrs
        self.nodes[cid]["methods"] = methods
        return cid

    def add_erd_table(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        table_name: str,
        badge: str,
        columns: list[tuple[str, str, str]],
        header_fill: str = NAVY,
    ) -> str:
        rows_html = "<br>".join(
            f"<b>[{key}]</b> {col}: <i>{dtype}</i>" if key else f"&nbsp;&nbsp;&nbsp;{col}: <i>{dtype}</i>"
            for key, col, dtype in columns
        )
        html_label = f"<b>{table_name} ({badge})</b><hr>{rows_html}"
        cid = self.add_box(
            x=x,
            y=y,
            w=w,
            h=h,
            label=html_label,
            fill=WHITE,
            stroke=header_fill,
            font_color=TEXT_DARK,
            rounded=True,
            font_size=11,
            kind="erd_table",
            align="left",
            header_band=header_fill,
            header_title=f"{table_name}  [{badge}]",
        )
        self.nodes[cid]["columns"] = columns
        return cid

    def add_edge(
        self,
        src: str,
        dst: str,
        label: str = "",
        points: list[tuple[int, int]] | None = None,
        dashed: bool = False,
        stroke: str = SLATE,
        arrow: str = "block",
        start_label: str = "",
        end_label: str = "",
        label_pos_idx: int | None = None,
    ) -> str:
        eid = self._new_id("e")
        end_arrow = "open" if arrow == "open" else ("block" if arrow in ("block", "hollow") else "none")
        end_fill = "0" if arrow == "hollow" else "1"
        style = (
            f"edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            f"strokeColor={stroke};strokeWidth=1.8;fontColor={TEXT_DARK};fontSize=11;"
            f"endArrow={end_arrow};endFill={end_fill};"
            + ("dashed=1;dashPattern=6 4;" if dashed else "")
        )
        self.edges.append(
            {
                "id": eid,
                "src": src,
                "dst": dst,
                "label": label,
                "points": points or [],
                "dashed": dashed,
                "stroke": stroke,
                "arrow": arrow,
                "style": style,
                "start_label": start_label,
                "end_label": end_label,
                "label_pos_idx": label_pos_idx,
            }
        )
        return eid

    def to_xml(self) -> str:
        mxfile = ET.Element(
            "mxfile",
            {
                "host": "Electron",
                "agent": "ContextForge-ERS-Generator/2.0",
                "version": "24.7.17",
                "type": "device",
            },
        )
        diagram = ET.SubElement(mxfile, "diagram", {"id": self.diagram_id, "name": self.name})
        model = ET.SubElement(
            diagram,
            "mxGraphModel",
            {
                "dx": str(self.width),
                "dy": str(self.height),
                "grid": "1",
                "gridSize": "10",
                "guides": "1",
                "tooltips": "1",
                "connect": "1",
                "arrows": "1",
                "fold": "1",
                "page": "1",
                "pageScale": "1",
                "pageWidth": str(self.width),
                "pageHeight": str(self.height),
                "math": "0",
                "shadow": "0",
            },
        )
        root = ET.SubElement(model, "root")
        ET.SubElement(root, "mxCell", {"id": "0"})
        ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

        for node in sorted(self.nodes.values(), key=lambda item: int(item.get("z", 10))):
            cell = ET.SubElement(
                root,
                "mxCell",
                {
                    "id": node["id"],
                    "value": node["label"],
                    "style": node["style"],
                    "vertex": "1",
                    "parent": "1",
                },
            )
            ET.SubElement(
                cell,
                "mxGeometry",
                {
                    "x": str(node["x"]),
                    "y": str(node["y"]),
                    "width": str(node["w"]),
                    "height": str(node["h"]),
                    "as": "geometry",
                },
            )

        for edge in self.edges:
            lbl = edge["label"]
            if edge["start_label"] or edge["end_label"]:
                card = f"{edge['start_label']}..{edge['end_label']}".strip(".")
                lbl = f"{lbl} ({card})" if lbl else card
            cell = ET.SubElement(
                root,
                "mxCell",
                {
                    "id": edge["id"],
                    "value": lbl,
                    "style": edge["style"],
                    "edge": "1",
                    "parent": "1",
                    "source": edge["src"],
                    "target": edge["dst"],
                },
            )
            geom = ET.SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
            if edge["points"]:
                arr = ET.SubElement(geom, "Array", {"as": "points"})
                for px, py in edge["points"]:
                    ET.SubElement(arr, "mxPoint", {"x": str(px), "y": str(py)})

        ET.indent(mxfile, space="  ")
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(mxfile, encoding="unicode") + "\n"

    def save_all(self, filename_stem: str, custom_draw_hook: Any = None) -> tuple[Path, Path]:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        drawio_path = OUT_DIR / f"{filename_stem}.drawio"
        png_path = OUT_DIR / f"{filename_stem}.png"

        drawio_path.write_text(self.to_xml(), encoding="utf-8")
        self._render_png(png_path, custom_draw_hook=custom_draw_hook)
        return drawio_path, png_path

    def _render_png(self, png_path: Path, custom_draw_hook: Any = None) -> None:
        scale = 2  # High-DPI supersampling
        img = Image.new("RGB", (self.width * scale, self.height * scale), WHITE)
        draw = ImageDraw.Draw(img)

        # Subtle outer frame
        draw.rectangle(
            [12 * scale, 10 * scale, (self.width - 12) * scale, (self.height - 10) * scale],
            outline="#CBD5E1",
            width=2,
        )

        # 1. Draw containers first
        for node in sorted(self.nodes.values(), key=lambda item: int(item.get("z", 10))):
            if node["kind"] == "container":
                self._draw_container(draw, node, scale)

        # 2. Custom background hook (e.g., sequence lifelines & combined fragments)
        if custom_draw_hook is not None:
            custom_draw_hook(draw, scale, "under")

        # 3. Draw edges behind foreground nodes (unless custom sequence diagram handles messages)
        if custom_draw_hook is None:
            for edge in self.edges:
                self._draw_edge(draw, edge, scale)

        # 4. Draw foreground nodes
        for node in sorted(self.nodes.values(), key=lambda item: int(item.get("z", 10))):
            if node["kind"] == "container":
                continue
            self._draw_node(draw, node, scale)

        # 5. Custom foreground hook (e.g., sequence arrows on top of lifelines)
        if custom_draw_hook is not None:
            custom_draw_hook(draw, scale, "over")

        img.save(png_path, format="PNG", dpi=(300, 300), optimize=True)

    def _draw_dashed_line(
        self,
        draw: ImageDraw.ImageDraw,
        p1: tuple[float, float],
        p2: tuple[float, float],
        color: str,
        width: int,
        dash_len: int = 12,
        gap_len: int = 8,
    ) -> None:
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        dist = math.hypot(dx, dy)
        if dist == 0:
            return
        ux, uy = dx / dist, dy / dist
        pos = 0.0
        while pos < dist:
            end = min(pos + dash_len, dist)
            draw.line(
                [(p1[0] + ux * pos, p1[1] + uy * pos), (p1[0] + ux * end, p1[1] + uy * end)],
                fill=color,
                width=width,
            )
            pos += dash_len + gap_len

    def _draw_dashed_rect(
        self,
        draw: ImageDraw.ImageDraw,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        color: str,
        width: int,
    ) -> None:
        self._draw_dashed_line(draw, (x1, y1), (x2, y1), color, width)
        self._draw_dashed_line(draw, (x2, y1), (x2, y2), color, width)
        self._draw_dashed_line(draw, (x2, y2), (x1, y2), color, width)
        self._draw_dashed_line(draw, (x1, y2), (x1, y1), color, width)

    def _draw_container(self, draw: ImageDraw.ImageDraw, node: dict[str, Any], s: int) -> None:
        x1, y1 = node["x"] * s, node["y"] * s
        x2, y2 = (node["x"] + node["w"]) * s, (node["y"] + node["h"]) * s
        hdr_h = 34 * s
        draw.rectangle([x1, y1, x2, y2], fill=node["fill"])
        draw.rectangle([x1, y1, x2, y1 + hdr_h], fill=node["header_fill"])
        if node.get("dashed"):
            self._draw_dashed_rect(draw, x1, y1, x2, y2, node["stroke"], 3)
            draw.line([(x1, y1 + hdr_h), (x2, y1 + hdr_h)], fill=node["stroke"], width=2)
        else:
            draw.rectangle([x1, y1, x2, y2], outline=node["stroke"], width=3)
            draw.line([(x1, y1 + hdr_h), (x2, y1 + hdr_h)], fill=node["stroke"], width=2)

        font = _load_font(13 * s, bold=True)
        draw.text((x1 + 14 * s, y1 + 8 * s), node["label"], fill=node["font_color"], font=font)

    def _wrap_text(self, draw: ImageDraw.ImageDraw, text: str, font: Any, max_w: int) -> list[str]:
        words = text.split()
        if not words:
            return [""]
        lines: list[str] = []
        curr = words[0]
        for word in words[1:]:
            test = f"{curr} {word}"
            bbox = draw.textbbox((0, 0), test, font=font)
            if (bbox[2] - bbox[0]) <= max_w:
                curr = test
            else:
                lines.append(curr)
                curr = word
        lines.append(curr)
        return lines

    def _parse_html_lines(self, html_label: str, default_size: int) -> list[tuple[str, bool, bool, int]]:
        raw = (
            html_label.replace("<hr>", "\n---\n")
            .replace("<br/>", "\n")
            .replace("<br>", "\n")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&nbsp;", " ")
        )
        out: list[tuple[str, bool, bool, int]] = []
        for part in raw.split("\n"):
            p = part.strip()
            if not p:
                continue
            is_bold = "<b>" in p
            is_italic = "<i>" in p
            clean = (
                p.replace("<b>", "")
                .replace("</b>", "")
                .replace("<i>", "")
                .replace("</i>", "")
            )
            out.append((clean, is_bold, is_italic, default_size))
        return out

    def _draw_node(self, draw: ImageDraw.ImageDraw, node: dict[str, Any], s: int) -> None:
        x1, y1 = node["x"] * s, node["y"] * s
        w, h = node["w"] * s, node["h"] * s
        x2, y2 = x1 + w, y1 + h
        kind = node["kind"]

        if kind == "actor":
            cx = x1 + w // 2
            r = 12 * s
            cy = y1 + r + 2 * s
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=node["fill"], outline=node["stroke"], width=3)
            body_top = cy + r
            body_bot = y1 + int(h * 0.65)
            draw.line([(cx, body_top), (cx, body_bot)], fill=node["stroke"], width=3)
            arm_y = body_top + 12 * s
            draw.line([(cx - 18 * s, arm_y), (cx + 18 * s, arm_y)], fill=node["stroke"], width=3)
            draw.line([(cx, body_bot), (cx - 16 * s, y2 - 4 * s)], fill=node["stroke"], width=3)
            draw.line([(cx, body_bot), (cx + 16 * s, y2 - 4 * s)], fill=node["stroke"], width=3)

            f_bold = _load_font(11 * s, bold=True)
            f_it = _load_font(10 * s, italic=True)
            nb = draw.textbbox((0, 0), node["name"], font=f_bold)
            rb = draw.textbbox((0, 0), node["role_tag"], font=f_it)
            draw.text((cx - (nb[2] - nb[0]) // 2, y2 + 4 * s), node["name"], fill=TEXT_DARK, font=f_bold)
            draw.text((cx - (rb[2] - rb[0]) // 2, y2 + 20 * s), node["role_tag"], fill=SLATE, font=f_it)
            return

        if kind == "uml_class":
            # Shadow + sharp class box
            draw.rectangle([x1 + 3 * s, y1 + 3 * s, x2 + 3 * s, y2 + 3 * s], fill="#E2E8F0")
            draw.rectangle([x1, y1, x2, y2], fill=node["fill"], outline=node["stroke"], width=3)
            hdr_h = 44 * s
            draw.rectangle([x1, y1, x2, y1 + hdr_h], fill=node["header_band"], outline=node["stroke"], width=2)
            hdr_lines = (node["header_title"] or "").split("\n")
            f_st = _load_font(10 * s, italic=True)
            f_ti = _load_font(12 * s, bold=True)
            if len(hdr_lines) == 2:
                sb = draw.textbbox((0, 0), hdr_lines[0], font=f_st)
                tb = draw.textbbox((0, 0), hdr_lines[1], font=f_ti)
                draw.text((x1 + (w - (sb[2] - sb[0])) // 2, y1 + 5 * s), hdr_lines[0], fill="#E2E8F0", font=f_st)
                draw.text((x1 + (w - (tb[2] - tb[0])) // 2, y1 + 21 * s), hdr_lines[1], fill=WHITE, font=f_ti)
            f_mono = _load_font(10 * s, mono=True)
            cy = y1 + hdr_h + 6 * s
            for attr in node.get("attrs", []):
                draw.text((x1 + 8 * s, cy), attr, fill=TEXT_DARK, font=f_mono)
                cy += 15 * s
            cy += 3 * s
            draw.line([(x1, cy), (x2, cy)], fill=node["stroke"], width=2)
            cy += 6 * s
            for meth in node.get("methods", []):
                draw.text((x1 + 8 * s, cy), meth, fill="#1E3A8A", font=f_mono)
                cy += 15 * s
            return

        if kind == "erd_table":
            draw.rounded_rectangle([x1 + 3 * s, y1 + 3 * s, x2 + 3 * s, y2 + 3 * s], radius=8 * s, fill="#E2E8F0")
            draw.rounded_rectangle([x1, y1, x2, y2], radius=8 * s, fill=WHITE, outline=node["stroke"], width=3)
            hdr_h = 32 * s
            draw.rounded_rectangle([x1, y1, x2, y1 + hdr_h], radius=8 * s, fill=node["header_band"])
            draw.rectangle([x1, y1 + hdr_h - 8 * s, x2, y1 + hdr_h], fill=node["header_band"])
            f_hdr = _load_font(11 * s, bold=True)
            draw.text((x1 + 10 * s, y1 + 8 * s), node["header_title"] or "", fill=WHITE, font=f_hdr)

            f_key = _load_font(9 * s, bold=True, mono=True)
            f_col = _load_font(10 * s, mono=True)
            f_typ = _load_font(9 * s, mono=True)
            cy = y1 + hdr_h + 6 * s
            for idx, (key, col, dtype) in enumerate(node.get("columns", [])):
                if idx % 2 == 1:
                    draw.rectangle([x1 + 2 * s, cy - 1 * s, x2 - 2 * s, cy + 15 * s], fill="#F8FAFC")
                if key:
                    badge_col = "#B45309" if "PK" in key else ("#0F766E" if "FK" in key else "#6B21A8")
                    draw.text((x1 + 8 * s, cy + 1 * s), key, fill=badge_col, font=f_key)
                draw.text((x1 + 48 * s, cy), col, fill=TEXT_DARK, font=f_col)
                tb = draw.textbbox((0, 0), dtype, font=f_typ)
                draw.text((x2 - (tb[2] - tb[0]) - 8 * s, cy + 1 * s), dtype, fill=SLATE, font=f_typ)
                cy += 16 * s
            return

        # Standard shapes: ellipse, cylinder, banner, rect
        shape = node.get("shape", "rect")
        if shape == "ellipse":
            draw.ellipse([x1 + 2 * s, y1 + 2 * s, x2 + 2 * s, y2 + 2 * s], fill="#E2E8F0")
            draw.ellipse([x1, y1, x2, y2], fill=node["fill"], outline=node["stroke"], width=3)
        elif shape == "cylinder":
            cap_h = 14 * s
            draw.rectangle([x1, y1 + cap_h // 2, x2, y2 - cap_h // 2], fill=node["fill"], outline=node["stroke"], width=3)
            draw.ellipse([x1, y2 - cap_h, x2, y2], fill=node["fill"], outline=node["stroke"], width=3)
            draw.rectangle([x1 + 2 * s, y1 + cap_h // 2, x2 - 2 * s, y2 - cap_h // 2], fill=node["fill"])
            draw.ellipse([x1, y1, x2, y1 + cap_h], fill=node["fill"], outline=node["stroke"], width=3)
        else:
            if kind != "banner":
                draw.rounded_rectangle([x1 + 3 * s, y1 + 3 * s, x2 + 3 * s, y2 + 3 * s], radius=8 * s, fill="#E2E8F0")
            if node.get("dashed"):
                draw.rectangle([x1, y1, x2, y2], fill=node["fill"])
                self._draw_dashed_rect(draw, x1, y1, x2, y2, node["stroke"], 3)
            elif node.get("rounded", True):
                draw.rounded_rectangle([x1, y1, x2, y2], radius=8 * s, fill=node["fill"], outline=node["stroke"], width=3)
            else:
                draw.rectangle([x1, y1, x2, y2], fill=node["fill"], outline=node["stroke"], width=3)

        # Render text lines centered or left-aligned inside box
        pad_x = 14 * s if shape != "ellipse" else 22 * s
        max_text_w = max(40 * s, w - 2 * pad_x)
        rendered_rows: list[tuple[str, Any, int]] = []

        if node.get("raw_lines"):
            for txt, is_b, fsz in node["raw_lines"]:
                fnt = _load_font(fsz * s, bold=is_b)
                for wl in self._wrap_text(draw, txt, fnt, max_text_w):
                    bb = draw.textbbox((0, 0), wl, font=fnt)
                    rendered_rows.append((wl, fnt, bb[3] - bb[1]))
        else:
            parsed = self._parse_html_lines(node["label"], node.get("font_size", 11))
            for idx, (txt, is_b, is_i, fsz) in enumerate(parsed):
                eff_sz = fsz if idx == 0 or is_b else max(9, fsz - 1)
                fnt = _load_font(eff_sz * s, bold=is_b, italic=is_i)
                for wl in self._wrap_text(draw, txt, fnt, max_text_w):
                    bb = draw.textbbox((0, 0), wl, font=fnt)
                    rendered_rows.append((wl, fnt, bb[3] - bb[1]))

        line_gap = 4 * s
        total_h = sum(rh for _, _, rh in rendered_rows) + max(0, len(rendered_rows) - 1) * line_gap
        top_offset = (8 * s) if shape == "cylinder" else 0
        curr_y = y1 + top_offset + max(4 * s, (h - top_offset - total_h) // 2)
        for wl, fnt, rh in rendered_rows:
            bb = draw.textbbox((0, 0), wl, font=fnt)
            tw = bb[2] - bb[0]
            tx = (x1 + (w - tw) // 2) if node.get("align", "center") == "center" else (x1 + pad_x)
            draw.text((tx, curr_y), wl, fill=node["font_color"], font=fnt)
            curr_y += rh + line_gap

    def _anchor_point(self, node: dict[str, Any], target_pt: tuple[float, float], s: int) -> tuple[float, float]:
        cx = (node["x"] + node["w"] / 2.0) * s
        cy = (node["y"] + node["h"] / 2.0) * s
        hw = (node["w"] / 2.0) * s
        hh = (node["h"] / 2.0) * s
        dx = target_pt[0] - cx
        dy = target_pt[1] - cy
        if abs(dx) < 1e-3 and abs(dy) < 1e-3:
            return cx, cy
        if abs(dx) * hh > abs(dy) * hw:
            return (cx + hw if dx > 0 else cx - hw), cy + dy * (hw / abs(dx))
        return cx + dx * (hh / abs(dy)), (cy + hh if dy > 0 else cy - hh)

    def _draw_arrowhead(
        self,
        draw: ImageDraw.ImageDraw,
        p_from: tuple[float, float],
        p_to: tuple[float, float],
        color: str,
        arrow: str,
        s: int,
    ) -> None:
        if arrow == "none":
            return
        dx, dy = p_to[0] - p_from[0], p_to[1] - p_from[1]
        dist = math.hypot(dx, dy)
        if dist < 1:
            return
        ux, uy = dx / dist, dy / dist
        px, py = -uy, ux
        alen = 11 * s
        awid = 6 * s
        b1 = (p_to[0] - ux * alen + px * awid, p_to[1] - uy * alen + py * awid)
        b2 = (p_to[0] - ux * alen - px * awid, p_to[1] - uy * alen - py * awid)
        if arrow == "open":
            draw.line([b1, p_to, b2], fill=color, width=3)
        elif arrow == "hollow":
            draw.polygon([p_to, b1, b2], fill=WHITE, outline=color, width=3)
        else:
            draw.polygon([p_to, b1, b2], fill=color, outline=color)

    def _draw_edge(self, draw: ImageDraw.ImageDraw, edge: dict[str, Any], s: int) -> None:
        n1 = self.nodes[edge["src"]]
        n2 = self.nodes[edge["dst"]]
        pts_scaled = [(px * s, py * s) for px, py in edge["points"]]

        if pts_scaled:
            start_pt = self._anchor_point(n1, pts_scaled[0], s)
            end_pt = self._anchor_point(n2, pts_scaled[-1], s)
            poly = [start_pt, *pts_scaled, end_pt]
        else:
            c2 = ((n2["x"] + n2["w"] / 2.0) * s, (n2["y"] + n2["h"] / 2.0) * s)
            c1 = ((n1["x"] + n1["w"] / 2.0) * s, (n1["y"] + n1["h"] / 2.0) * s)
            start_pt = self._anchor_point(n1, c2, s)
            end_pt = self._anchor_point(n2, c1, s)
            poly = [start_pt, end_pt]

        for i in range(len(poly) - 1):
            if edge["dashed"]:
                self._draw_dashed_line(draw, poly[i], poly[i + 1], edge["stroke"], 3)
            else:
                draw.line([poly[i], poly[i + 1]], fill=edge["stroke"], width=3)

        self._draw_arrowhead(draw, poly[-2], poly[-1], edge["stroke"], edge["arrow"], s)

        f_lbl = _load_font(9 * s, bold=True)
        if edge["label"]:
            seg_idx = edge["label_pos_idx"] if edge["label_pos_idx"] is not None else (len(poly) - 2) // 2
            seg_idx = max(0, min(len(poly) - 2, seg_idx))
            mx = (poly[seg_idx][0] + poly[seg_idx + 1][0]) / 2.0
            my = (poly[seg_idx][1] + poly[seg_idx + 1][1]) / 2.0
            bb = draw.textbbox((0, 0), edge["label"], font=f_lbl)
            tw, th = bb[2] - bb[0], bb[3] - bb[1]
            draw.rounded_rectangle(
                [mx - tw / 2 - 5 * s, my - th / 2 - 3 * s, mx + tw / 2 + 5 * s, my + th / 2 + 3 * s],
                radius=4 * s,
                fill=WHITE,
                outline="#CBD5E1",
                width=1,
            )
            draw.text((mx - tw / 2, my - th / 2 - 1 * s), edge["label"], fill=TEXT_DARK, font=f_lbl)

        f_card = _load_font(9 * s, bold=True)
        if edge["start_label"]:
            sx, sy = poly[0]
            draw.rectangle([sx + 4 * s, sy - 14 * s, sx + 26 * s, sy - 1 * s], fill=WHITE)
            draw.text((sx + 5 * s, sy - 14 * s), edge["start_label"], fill=NAVY, font=f_card)
        if edge["end_label"]:
            ex, ey = poly[-1]
            draw.rectangle([ex - 32 * s, ey - 16 * s, ex - 4 * s, ey - 2 * s], fill=WHITE)
            draw.text((ex - 30 * s, ey - 16 * s), edge["end_label"], fill=NAVY, font=f_card)


# ============================================================================
# 1. C4 LEVEL 1 — SYSTEM CONTEXT DIAGRAM
# ============================================================================
def build_01_c4_context() -> tuple[Path, Path]:
    b = DrawioBuilder("c4_n1", "C4 Nivel 1 - Contexto ContextForge", 1500, 920)
    b.add_banner(
        "Diagrama de Contexto del Sistema — ContextForge (Modelo C4 - Nivel 1)",
        "Frontera sociotécnica entre consumidores humanos/agentes IA, plataforma soberana ContextForge y sistemas externos",
    )

    # Top row: Actors / Consumers
    p_cur = b.add_box(
        70, 130, 300, 125,
        "<b>Arquitecto / Curador Documental</b><br><i>[Persona — ACT-01]</i><br>Estructura libros Markdown, aprueba flujo editorial (PUBLISHED) y cura Context Bundles.",
        fill=NAVY_LIGHT, stroke=NAVY,
    )
    p_dev = b.add_box(
        420, 130, 300, 125,
        "<b>Desarrollador de Software</b><br><i>[Persona — ACT-02]</i><br>Ejecuta búsqueda híbrida, consulta chat RAG con citas verificables y comenta secciones.",
        fill=NAVY_LIGHT, stroke=NAVY,
    )
    p_adm = b.add_box(
        770, 130, 300, 125,
        "<b>Administrador de Plataforma y Seguridad</b><br><i>[Persona — ACT-04]</i><br>Gestiona proyectos aislados, motores BD/LLM, políticas RBAC y auditoría inmutable.",
        fill=NAVY_LIGHT, stroke=NAVY,
    )
    p_agt = b.add_box(
        1120, 130, 310, 125,
        "<b>Agentes de IA / IDEs / Apps Python</b><br><i>[Sistema Consumidor — ACT-03]</i><br>Cursor, Copilot, Claude, Antigravity o apps que usan SDK contextforge y servidor MCP.",
        fill=TEAL_LIGHT, stroke=TEAL,
    )

    # Center: Primary System
    sys_cf = b.add_box(
        410, 375, 680, 185,
        "<b>ContextForge: Plataforma Soberana &amp; SDK Reutilizable (v2.0)</b><br>"
        "<i>[Sistema de Software — Python 3.11+ / FastAPI / Clean Architecture]</i><br>"
        "Centraliza documentación Docs-as-Code con versionado y flujo editorial, ejecuta búsqueda híbrida "
        "(BM25 + Vectorial con fusión RRF), provee generación RAG con citas exactas, compila Context Bundles "
        "por presupuesto de tokens y expone API pública SDK, interfaz Web colaborativa y servidor MCP.",
        fill=NAVY, stroke="#0F172A", font_color=WHITE, font_size=12,
    )

    # Bottom row: External Systems
    ext_fs = b.add_box(
        70, 705, 300, 135,
        "<b>Repositorio Git / Filesystem Local</b><br><i>[Sistema Externo — ACT-06]</i><br>Archivos Markdown (.md) con frontmatter YAML y anexos técnicos (PDF, DOCX, Draw.io).",
        fill=SLATE_LIGHT, stroke=SLATE,
    )
    ext_ollama = b.add_box(
        420, 705, 300, 135,
        "<b>Servidor Local Ollama</b><br><i>[Sistema Externo Soberano — ACT-05]</i><br>Inferencia generativa y cálculo de embeddings en red local (localhost:11434) sin fuga de datos.",
        fill=TEAL_LIGHT, stroke=TEAL,
    )
    ext_cloud = b.add_box(
        770, 705, 300, 135,
        "<b>Proveedores Cloud Multi-LLM</b><br><i>[Sistema Externo Opcional — ACT-05]</i><br>OpenAI, Google Gemini, Anthropic Claude (sujetos a política sovereign_only y filtro DLP).",
        fill=AMBER_LIGHT, stroke=AMBER, dashed=True,
    )
    ext_oidc = b.add_box(
        1120, 705, 310, 135,
        "<b>Proveedor de Identidad OIDC / JWT</b><br><i>[Sistema Externo Seguridad — ACT-07]</i><br>Emisión y validación criptográfica de tokens OAuth2/JWT (RS256) para control RBAC.",
        fill=PURPLE_LIGHT, stroke=PURPLE,
    )

    b.add_edge(p_cur, sys_cf, "Edita, versiona y publica [HTTPS / WS]", points=[(220, 320), (550, 320)], stroke=NAVY)
    b.add_edge(p_dev, sys_cf, "Busca y consulta RAG [HTTPS / SSE]", points=[(570, 300), (680, 300)], stroke=NAVY)
    b.add_edge(p_adm, sys_cf, "Configura motores, RBAC y audita [HTTPS]", points=[(920, 300), (830, 300)], stroke=NAVY)
    b.add_edge(p_agt, sys_cf, "Importa SDK / Invoca tools [Python / MCP JSON-RPC]", points=[(1275, 320), (960, 320)], stroke=TEAL)

    b.add_edge(sys_cf, ext_fs, "Sincroniza incremental SHA-256 [I/O UTF-8]", points=[(540, 635), (220, 635)], stroke=SLATE)
    b.add_edge(sys_cf, ext_ollama, "Genera respuestas y embeddings [HTTP Local]", points=[(670, 650), (570, 650)], stroke=TEAL)
    b.add_edge(sys_cf, ext_cloud, "Delega síntesis autorizada [HTTPS TLS 1.3]", points=[(840, 650), (920, 650)], stroke=AMBER, dashed=True)
    b.add_edge(sys_cf, ext_oidc, "Valida tokens e identidad [OIDC / JWKS]", points=[(970, 635), (1275, 635)], stroke=PURPLE)

    return b.save_all("01_diagrama_contexto_c4_n1")


# ============================================================================
# 2. C4 LEVEL 2 — CONTAINER DIAGRAM
# ============================================================================
def build_02_c4_containers() -> tuple[Path, Path]:
    b = DrawioBuilder("c4_n2", "C4 Nivel 2 - Contenedores ContextForge", 1680, 1040)
    b.add_banner(
        "Diagrama de Contenedores — Plataforma y Componente ContextForge (Modelo C4 - Nivel 2)",
        "Descomposición en contenedores ejecutables, núcleo reutilizable sin dependencias, almacenes persistentes y canales de integración",
    )

    # Top external actors
    u_hum = b.add_box(
        90, 110, 420, 88,
        "<b>Usuarios Humanos (Curador / Desarrollador / Admin)</b><br><i>Navegador Web Moderno (HTTPS / SSE / WSS)</i>",
        fill=NAVY_LIGHT, stroke=NAVY,
    )
    u_agt = b.add_box(
        980, 110, 560, 88,
        "<b>Agentes de IA, IDEs (Cursor/Copilot/Claude) y Aplicaciones Python Anfitrionas</b><br><i>Clientes MCP JSON-RPC 2.0 y Consumidores directos del Paquete Python contextforge</i>",
        fill=TEAL_LIGHT, stroke=TEAL,
    )

    # System Boundary
    b.add_container(
        50, 245, 1270, 745,
        "Frontera del Sistema: ContextForge Ecosystem (v2.0)",
        fill="#F8FAFC", stroke=NAVY, header_fill="#DBEAFE", header_text=NAVY, dashed=True,
    )

    # Tier 1 inside boundary: Presentation / Entry containers
    c_web = b.add_box(
        85, 305, 360, 130,
        "<b>Aplicación Web Screaming Architecture</b><br><i>[Contenedor: Jinja2 + HTMX + Tailwind CSS v4]</i><br>Explorador, Editor dividido con ETag, Chat RAG SSE, Compilador de Bundles y Panel Settings.",
        fill=WHITE, stroke=NAVY,
    )
    c_ws = b.add_box(
        485, 305, 350, 130,
        "<b>Hub Colaborativo en Tiempo Real</b><br><i>[Contenedor: FastAPI WebSockets]</i><br>Salas por proyecto y documento, presencia en vivo, alertas de edición e hilos de comentarios.",
        fill=WHITE, stroke=INDIGO,
    )
    c_mcp = b.add_box(
        875, 305, 395, 130,
        "<b>Servidor Universal MCP (/mcp)</b><br><i>[Contenedor: FastMCP / JSON-RPC 2.0 + Stdio]</i><br>Expone search_project_context, get_document_full y list_project_structure a agentes IA.",
        fill=TEAL_LIGHT, stroke=TEAL,
    )

    # Tier 2 inside boundary: Core API + SDK + Async Worker
    c_api = b.add_box(
        85, 525, 395, 155,
        "<b>Servidor API REST/SSE &amp; Bus CQRS</b><br><i>[Contenedor: Python 3.11+ / FastAPI]</i><br>Casos de uso granulares (Commands/Queries), Auth OAuth2/JWT + API-Key RBAC, errores RFC 7807, política sovereign_only y bóveda AES-256-GCM.",
        fill=NAVY_LIGHT, stroke=NAVY,
    )
    c_sdk = b.add_box(
        585, 525, 395, 155,
        "<b>Componente Reutilizable contextforge</b><br><i>[Paquete Python Instalable — 0 Dependencias]</i><br>API pública (ContextForge, Builder, 8 Contratos OCP) + motor privado _internal (RuleChain, Chunkers, BM25/Vector, RRF, Exporters, AuditDecorator).",
        fill="#ECFDF5", stroke=TEAL,
    )
    c_wrk = b.add_box(
        1020, 525, 265, 155,
        "<b>Worker Asíncrono de Indexación</b><br><i>[Contenedor: Cola + DLQ]</i><br>Reindexación incremental SHA-256, extracción PDF/DOCX y backoff exponencial.",
        fill=AMBER_LIGHT, stroke=AMBER,
    )

    # Tier 3 inside boundary: Persistence Stores
    s_db = b.add_box(
        85, 785, 380, 160,
        "<b>Base de Datos Relacional</b><br><i>[SQLite 3 WAL / PostgreSQL 15+]</i><br>Proyectos, libros, versiones inmutables, sesiones RAG, manifiestos de bundles, usuarios RBAC y audit_logs.",
        fill=WHITE, stroke=NAVY, shape="cylinder",
    )
    s_vec = b.add_box(
        515, 785, 385, 160,
        "<b>Almacén Híbrido Léxico-Vectorial</b><br><i>[ChromaDB HNSW + Índice BM25]</i><br>Fragmentos publicados (PUBLISHED), embeddings semánticos y pesos léxicos aislados por project_slug.",
        fill=WHITE, stroke=TEAL, shape="cylinder",
    )
    s_fs = b.add_box(
        950, 785, 335, 160,
        "<b>Almacén Docs-as-Code</b><br><i>[Filesystem Confinado UTF-8]</i><br>Árbol de archivos .md sincronizados y anexos validados con suma SHA-256.",
        fill=WHITE, stroke=SLATE, shape="cylinder",
    )

    # Right External Systems outside boundary
    ext_llm = b.add_box(
        1355, 480, 285, 180,
        "<b>Proveedores Multi-LLM</b><br><i>[Externos / Local]</i><br>• Ollama Local (:11434)<br>• OpenAI / Gemini / Claude<br>• Fallback Extractivo Determinista",
        fill=SLATE_LIGHT, stroke=SLATE,
    )
    ext_idp = b.add_box(
        1355, 740, 285, 145,
        "<b>Proveedor OIDC / JWKS</b><br><i>[Identidad Empresarial]</i><br>Validación federada de identidades humanas y claves públicas RS256.",
        fill=PURPLE_LIGHT, stroke=PURPLE,
    )

    # Clean orthogonal edges
    b.add_edge(u_hum, c_web, "Navega y edita [HTTPS]", points=[(265, 215), (265, 232)], label_pos_idx=0, stroke=NAVY)
    b.add_edge(u_hum, c_ws, "Presencia en vivo [WSS]", points=[(430, 222), (660, 222)], label_pos_idx=1, stroke=INDIGO)
    b.add_edge(u_agt, c_mcp, "JSON-RPC 2.0 [HTTP/Stdio]", points=[(1072, 215), (1072, 232)], label_pos_idx=0, stroke=TEAL)
    b.add_edge(u_agt, c_sdk, "Importa API pública Python", points=[(1300, 222), (1300, 472), (782, 472)], label_pos_idx=2, stroke=TEAL, dashed=True)

    b.add_edge(c_web, c_api, "Comandos/Queries + SSE", points=[(265, 480), (265, 500)], stroke=NAVY)
    b.add_edge(c_ws, c_api, "Sincroniza eventos", points=[(660, 480), (390, 480)], label_pos_idx=1, stroke=INDIGO)
    b.add_edge(c_mcp, c_sdk, "Búsqueda y bundles", points=[(1050, 448), (850, 448)], label_pos_idx=1, stroke=TEAL)

    b.add_edge(c_api, c_sdk, "Facade", stroke=TEAL)
    b.add_edge(c_api, c_wrk, "Encola IndexingJob", points=[(440, 705), (1150, 705)], label_pos_idx=1, stroke=AMBER)

    b.add_edge(c_api, s_db, "SQLAlchemy Async UoW", stroke=NAVY)
    b.add_edge(c_sdk, s_vec, "RRF: BM25 + Vectores", stroke=TEAL)
    b.add_edge(c_wrk, s_vec, "Actualiza chunks", points=[(1080, 740), (790, 740)], label_pos_idx=1, stroke=AMBER)
    b.add_edge(c_wrk, s_fs, "Lee .md y anexos", stroke=SLATE)

    b.add_edge(c_sdk, ext_llm, "ILLMProvider [HTTP]", points=[(782, 498), (1495, 498)], label_pos_idx=1, stroke=SLATE)
    b.add_edge(c_api, ext_idp, "Verifica JWT [HTTPS]", points=[(460, 762), (1330, 762)], label_pos_idx=1, stroke=PURPLE, dashed=True)

    return b.save_all("02_diagrama_contenedores_c4_n2")


# ============================================================================
# 3. GENERAL UML 2.5 USE CASE DIAGRAM
# ============================================================================
def build_03_use_cases() -> tuple[Path, Path]:
    b = DrawioBuilder("uml_uc", "Casos de Uso UML - ContextForge", 1680, 1100)
    b.add_banner(
        "Diagrama General de Casos de Uso UML 2.5 — ContextForge",
        "Actores primarios y secundarios, frontera del sistema y relaciones estereotipadas <<include>> y <<extend>> (CU-01 a CU-14)",
    )

    # Left Primary Actors
    a_cur = b.add_actor(85, 185, 56, 95, "ACT-01: Arquitecto / Curador", "Actor Primario")
    a_dev = b.add_actor(85, 445, 56, 95, "ACT-02: Desarrollador", "Actor Primario")
    a_agt = b.add_actor(85, 700, 56, 95, "ACT-03: Agente IA / SDK-MCP", "Actor Primario", stroke=TEAL)
    a_adm = b.add_actor(85, 935, 56, 95, "ACT-04: Admin y Seguridad", "Actor Primario", stroke=PURPLE)

    # Right Secondary Actors
    a_fs = b.add_actor(1525, 250, 56, 95, "ACT-06: Filesystem Git", "Actor Secundario", stroke=SLATE)
    a_llm = b.add_actor(1525, 565, 56, 95, "ACT-05: Proveedor Multi-LLM", "Actor Secundario", stroke=TEAL)
    a_idp = b.add_actor(1525, 865, 56, 95, "ACT-07: Identidad OIDC/JWT", "Actor Secundario", stroke=PURPLE)

    # System Boundary
    b.add_container(
        265, 115, 1145, 945,
        "<<system>> Plataforma Soberana y Componente Reutilizable ContextForge",
        fill="#F8FAFC", stroke=NAVY, header_fill="#DBEAFE", header_text=NAVY, dashed=False,
    )

    # Left column of Use Cases (Primary Initiated)
    uc01 = b.add_box(320, 165, 330, 68, "<b>CU-01:</b> Gestionar Espacios de Proyecto y Taxonomía", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse")
    uc02 = b.add_box(320, 255, 330, 68, "<b>CU-02:</b> Crear e Ingestar Documento Markdown", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse")
    uc03 = b.add_box(320, 345, 330, 68, "<b>CU-03:</b> Editar con Vista Dividida y Concurrencia ETag", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse")
    uc04 = b.add_box(320, 435, 330, 68, "<b>CU-04:</b> Aprobar y Publicar Flujo Editorial", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse")
    uc05 = b.add_box(320, 525, 330, 68, "<b>CU-05:</b> Cargar y Extraer Anexos Técnicos", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse")
    uc11 = b.add_box(320, 615, 330, 68, "<b>CU-11:</b> Colaborar en Tiempo Real y Comentar", fill=INDIGO_LIGHT, stroke=INDIGO, shape="ellipse")
    uc09 = b.add_box(320, 705, 330, 68, "<b>CU-09:</b> Compilar y Exportar Context Bundle", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse")
    uc10 = b.add_box(320, 795, 330, 68, "<b>CU-10:</b> Servir Contexto vía Servidor MCP", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse")
    uc12 = b.add_box(320, 885, 330, 68, "<b>CU-12:</b> Extender Contratos SDK (OCP)", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse")
    uc13 = b.add_box(320, 972, 330, 68, "<b>CU-13:</b> Configurar y Diagnosticar Motores BD / LLM", fill=PURPLE_LIGHT, stroke=PURPLE, shape="ellipse")

    # Right column of Use Cases (Included / Core Engine / Extended)
    uc06 = b.add_box(955, 265, 375, 76, "<b>CU-06:</b> Segmentar e Indexar Incrementalmente (SHA-256 + DLQ)", fill=AMBER_LIGHT, stroke=AMBER, shape="ellipse")
    uc07 = b.add_box(955, 455, 375, 76, "<b>CU-07:</b> Ejecutar Búsqueda Híbrida (BM25 + Vectorial RRF)", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse")
    uc08 = b.add_box(955, 620, 375, 78, "<b>CU-08:</b> Consultar Asistente RAG con Citas en Streaming SSE", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse")
    uc_fb = b.add_box(955, 755, 375, 68, "<b>Extensión:</b> Conmutar a Fallback Extractivo Local (BR-12)", fill=AMBER_LIGHT, stroke=AMBER, shape="ellipse", dashed=True)
    uc14 = b.add_box(955, 895, 375, 80, "<b>CU-14:</b> Autenticar JWT/API-Key, Autorizar RBAC y Auditar", fill=PURPLE_LIGHT, stroke=PURPLE, shape="ellipse")

    # Actor associations (clean straight/orthogonal segments)
    for uc in (uc01, uc02, uc03, uc04, uc05):
        b.add_edge(a_cur, uc, arrow="none", stroke=NAVY)
    for uc in (uc11, uc09):
        b.add_edge(a_dev, uc, arrow="none", stroke=NAVY)
    b.add_edge(a_dev, uc07, points=[(210, 492), (790, 492)], arrow="none", stroke=TEAL)
    b.add_edge(a_dev, uc08, points=[(210, 515), (770, 515), (770, 659)], arrow="none", stroke=TEAL)

    for uc in (uc09, uc10, uc12):
        b.add_edge(a_agt, uc, arrow="none", stroke=TEAL)
    b.add_edge(a_adm, uc01, points=[(45, 975), (45, 199)], arrow="none", stroke=PURPLE)
    b.add_edge(a_adm, uc13, arrow="none", stroke=PURPLE)
    b.add_edge(a_adm, uc14, points=[(210, 1050), (1142, 1050)], arrow="none", stroke=PURPLE)

    # Secondary actor links
    b.add_edge(uc06, a_fs, arrow="none", stroke=SLATE)
    b.add_edge(uc08, a_llm, arrow="none", stroke=TEAL)
    b.add_edge(uc13, a_llm, points=[(650, 1006), (1440, 1006), (1440, 615)], arrow="none", stroke=SLATE)
    b.add_edge(uc14, a_idp, arrow="none", stroke=PURPLE)

    # <<include>> & <<extend>> relationships inside boundary
    b.add_edge(uc02, uc06, "<<include>>", dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(uc04, uc06, "<<include>>", points=[(810, 469), (810, 315)], dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(uc05, uc06, "<<include>>", points=[(835, 559), (835, 330)], dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(uc08, uc07, "<<include>>", dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(uc09, uc07, "<<include>>", points=[(860, 739), (860, 505)], dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(uc10, uc07, "<<include>>", points=[(885, 829), (885, 520)], dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(uc_fb, uc08, "<<extend>>", dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(uc13, uc14, "<<include>>", points=[(780, 995), (780, 935)], dashed=True, arrow="open", stroke=PURPLE)
    b.add_edge(uc10, uc14, "<<include>>", points=[(740, 845), (740, 915)], dashed=True, arrow="open", stroke=PURPLE)

    return b.save_all("03_diagrama_casos_de_uso")


# ============================================================================
# 4. DOMAIN & COMPONENT UML 2.5 CLASS DIAGRAM
# ============================================================================
def build_04_domain_classes() -> tuple[Path, Path]:
    b = DrawioBuilder("uml_cls", "Clases de Dominio UML - ContextForge", 1820, 1140)
    b.add_banner(
        "Diagrama de Clases UML 2.5 — Dominio y Componente Reutilizable ContextForge",
        "Entidades, Objetos de Valor Inmutables, Puntos de Extensión Abiertos (OCP/DIP) y Patrones GoF (Facade, Builder, Strategy, Chain, Decorator, Observer)",
    )

    # Row 1: Builder, Facade, Project, KnowledgeDocument
    c_builder = b.add_uml_class(
        45, 115, 390, 225,
        "Builder", "ContextForgeBuilder",
        ["- _config: EngineConfig", "- _lexical_store: ILexicalStore | None", "- _vector_store: IVectorStore | None", "- _llm_provider: ILLMProvider | None"],
        ["+ with_config(cfg: EngineConfig): Self", "+ with_stores(lex, vec): Self", "+ with_exporter(exp: IBundleExporter): Self", "+ with_ranking_strategy(s): Self", "+ with_rule(rule: IDocumentRule): Self", "+ build(): ContextForge"],
        header_fill=INDIGO,
    )
    c_facade = b.add_uml_class(
        495, 115, 430, 240,
        "Facade", "ContextForge",
        ["- _rule_chain: DocumentRuleChain", "- _strategy_factory: StrategyFactory", "- _retriever: RetrieverFactory", "- _exporters: BundleExporterRegistry", "- _event_bus: KnowledgeEventBus"],
        ["+ ingest(docs, strategy): IngestionReport", "+ ingest_directory(dir, pattern): IngestionReport", "+ search(query, top_k, mode, ranking): list[SearchHit]", "+ ask(question, top_k, sys_prompt): RagResponse", "+ compile_bundle(name, query, max_tokens, fmt): ContextBundle", "+ subscribe(obs: IKnowledgeObserver): None"],
        header_fill=NAVY,
    )
    c_proj = b.add_uml_class(
        985, 115, 365, 225,
        "Entity", "Project",
        ["+ slug: str  {PK, BR-01}", "+ name: str", "+ path: str  {BR-03}", "+ sovereign_only: bool  {BR-13}", "+ max_quota_mb: int", "+ is_active: bool"],
        ["+ validate_path_confinement(target: Path): bool", "+ allows_external_llm(): bool", "+ activate(): None"],
        header_fill=NAVY,
    )
    c_doc = b.add_uml_class(
        1405, 115, 375, 240,
        "AggregateRoot", "KnowledgeDocument",
        ["+ doc_id: str  {PK}", "+ project_slug: str  {FK}", "+ title: str", "+ collection: str", "+ status: EditorialStatus  {BR-04, BR-05}", "+ current_version: int", "+ content_hash: str  {SHA-256}"],
        ["+ submit_review(): None", "+ publish(approver_id: str): DocumentVersion", "+ deprecate(): None", "+ rollback_to(ver: int): DocumentVersion"],
        header_fill=TEAL,
    )

    # Row 2: Value Objects & Collaborators
    c_audit = b.add_uml_class(
        45, 435, 390, 210,
        "Decorator / Observer", "AuditingDecorator & EventBus",
        ["+ audit_records: tuple[AuditRecord, ...]", "- _observers: list[IKnowledgeObserver]", "+ prev_hash: str  {SHA-256 chain}"],
        ["+ execute(op_name: str, fn: Callable): T", "+ publish(event_type: str, payload: dict): KnowledgeEvent", "+ subscribe(observer: IKnowledgeObserver): None"],
        header_fill=PURPLE,
    )
    c_rag = b.add_uml_class(
        495, 435, 430, 215,
        "ValueObject", "RagResponse & SourceCitation",
        ["+ question: str", "+ answer: str", "+ citations: tuple[SourceCitation, ...]  {BR-08}", "+ provider_name: str", "+ grounded: bool", "+ latency_ms: float"],
        ["+ has_verified_evidence(): bool", "+ format_citations_markdown(): str"],
        header_fill=SLATE,
    )
    c_bnd = b.add_uml_class(
        985, 435, 365, 215,
        "ValueObject", "ContextBundle",
        ["+ bundle_id: str  {UUID}", "+ name: str", "+ export_format: str", "+ included_doc_ids: tuple[str, ...]", "+ omitted_doc_ids: tuple[str, ...]", "+ estimated_tokens: int  {<= max_tokens}", "+ bundle_hash: str"],
        ["+ utilization_ratio(): float"],
        header_fill=SLATE,
    )
    c_ver = b.add_uml_class(
        1405, 435, 375, 215,
        "ValueObject", "DocumentVersion & DocumentChunk",
        ["+ version_number: int  {BR-06}", "+ chunk_id: str", "+ headers: tuple[str, ...]", "+ content_hash: str", "+ author_id: str", "+ created_at: datetime"],
        ["+ compute_diff(other: DocumentVersion): str", "+ estimate_tokens(): int"],
        header_fill=SLATE,
    )

    # Row 3: OCP Extension Contracts (Interfaces)
    i_rule = b.add_uml_class(
        45, 765, 320, 195,
        "interface", "IDocumentRule",
        ["+ rule_name: str  {abstract}"],
        ["+ validate(doc: KnowledgeDocument): None", "--- Implementaciones ---", "• NonEmptyId / TitleRequired", "• MaxContentLengthRule"],
        header_fill=AMBER, body_fill=AMBER_LIGHT,
    )
    i_chk = b.add_uml_class(
        400, 765, 325, 195,
        "interface", "IChunkingStrategy",
        ["+ name: str  {abstract}"],
        ["+ chunk(doc: KnowledgeDocument): list[Chunk]", "--- Implementaciones ---", "• HeadingAwareChunkingStrategy", "• SlidingWindowChunkingStrategy"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )
    i_rnk = b.add_uml_class(
        760, 765, 335, 195,
        "interface", "IHybridRankingStrategy",
        ["+ name: str  {abstract}"],
        ["+ fuse(lex, vec, top_k): list[SearchHit]", "--- Implementaciones ---", "• ReciprocalRankFusionStrategy", "• WeightedLinearRankingStrategy"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )
    i_exp = b.add_uml_class(
        1130, 765, 315, 195,
        "interface", "IBundleExporter",
        ["+ format_name: str  {abstract}"],
        ["+ export(name, docs, est, max): str", "--- Implementaciones ---", "• Markdown / Json / XmlExporter"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )
    i_llm = b.add_uml_class(
        1480, 765, 300, 195,
        "interface", "ILLMProvider & Stores",
        ["+ provider_name: str  {abstract}"],
        ["+ generate(prompt, sys): str", "• Ollama / Cloud / Extractive", "• ILexicalStore & IVectorStore"],
        header_fill=INDIGO, body_fill=INDIGO_LIGHT,
    )

    # Clean UML Relationships
    b.add_edge(c_builder, c_facade, "<<builds>>", dashed=True, arrow="open", stroke=INDIGO)
    b.add_edge(c_proj, c_doc, "aísla", start_label="1", end_label="0..*", stroke=NAVY)
    b.add_edge(c_doc, c_ver, "compone", start_label="1", end_label="1..*", stroke=TEAL)
    b.add_edge(c_facade, c_audit, "envuelve / emite", points=[(540, 395), (240, 395)], stroke=PURPLE)
    b.add_edge(c_facade, c_rag, "produce", stroke=NAVY)
    b.add_edge(c_facade, c_bnd, "compila", points=[(840, 395), (1167, 395)], stroke=NAVY)

    # Bottom bus line from Facade routed cleanly down corridor x=465 to OCP Interfaces
    b.add_edge(c_facade, i_rule, "valida cadena", points=[(465, 290), (465, 695), (205, 695)], label_pos_idx=3, dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(c_facade, i_chk, "segmenta", points=[(465, 290), (465, 695), (562, 695)], label_pos_idx=3, dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_rnk, "fusiona RRF", points=[(465, 290), (465, 695), (927, 695)], label_pos_idx=3, dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_exp, "serializa", points=[(465, 290), (465, 695), (1287, 695)], label_pos_idx=3, dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_llm, "delega síntesis", points=[(465, 290), (465, 695), (1630, 695)], label_pos_idx=3, dashed=True, arrow="open", stroke=INDIGO)

    return b.save_all("04_diagrama_clases_dominio")


# ============================================================================
# 5. UML 2.5 SEQUENCE DIAGRAM (MAIN CRITICAL FLOW + ALT/OPT)
# ============================================================================
def build_05_sequence() -> tuple[Path, Path]:
    b = DrawioBuilder("uml_seq", "Secuencia Principal RAG Hibrido - ContextForge", 1760, 1140)
    b.add_banner(
        "Diagrama de Secuencia UML 2.5 — Flujo Crítico: Consulta RAG Híbrida con Citas, Streaming SSE y Fallback",
        "Interacción cronológica con verificación RBAC/Soberanía (opt) y manejo de evidencia / resiliencia Multi-LLM (alt)",
    )

    lifelines = [
        ("L1", 60, "Usuario / Agente IA", "[Cliente Web / MCP]", NAVY_LIGHT, NAVY),
        ("L2", 305, "API SSE / Facade", "[ContextForge]", NAVY_LIGHT, NAVY),
        ("L3", 550, "Auth & SovereignGuard", "[RBAC + DLP]", PURPLE_LIGHT, PURPLE),
        ("L4", 805, "RetrieverFactory", "[Fusión RRF]", TEAL_LIGHT, TEAL),
        ("L5", 1055, "BM25 + ChromaDB", "[Índices PUBLISHED]", TEAL_LIGHT, TEAL),
        ("L6", 1305, "ILLMProvider", "[Ollama / Cloud / Fallback]", AMBER_LIGHT, AMBER),
        ("L7", 1550, "AuditLog & WS Hub", "[Append-Only + Eventos]", SLATE_LIGHT, SLATE),
    ]

    centers: list[int] = []
    lifeline_ids: list[str] = []
    for _, lx, title, sub, fill, stroke in lifelines:
        nid = b.add_box(lx, 110, 175, 62, f"<b>{title}</b><br><i>{sub}</i>", fill=fill, stroke=stroke, font_size=11)
        lifeline_ids.append(nid)
        centers.append(lx + 87)

    # Also add representative XML cells for fragments and messages so Draw.io editing is 100% rich
    b.add_container(285, 250, 480, 95, "opt [Proyecto sovereign_only == true o DLP activo]", fill="#FAF5FF", stroke=PURPLE, header_fill="#F3E8FF", header_text=PURPLE)
    b.add_container(45, 520, 1685, 445, "alt [max_score >= min_grounding_score (BR-08: Evidencia Suficiente)]", fill="#F0FDFA", stroke=TEAL, header_fill="#CCFBF1", header_text=TEAL)
    b.add_container(285, 615, 1220, 215, "alt [Proveedor Primario Disponible] / [else: Fallo o Timeout -> Fallback Extractivo (BR-12)]", fill="#FFFBEB", stroke=AMBER, header_fill="#FEF3C7", header_text=AMBER)

    messages = [
        (0, 1, 205, "1: POST /api/v1/chat/stream (question, project_slug, token)", False, NAVY),
        (1, 2, 235, "2: authorize(JWT/API-Key, project_slug) [RF-CFG-003]", False, PURPLE),
        (2, 2, 305, "3: enforce_sovereign_policy(BR-13) + redact_secrets_dlp()", False, PURPLE),
        (2, 1, 335, "4: Principal autorizado + prompt sanitizado", True, PURPLE),
        (1, 3, 380, "5: retrieve(query, top_k=5, mode='hybrid', ranking='rrf')", False, TEAL),
        (3, 4, 415, "6: search_bm25() + search_vectors(filter={status:'PUBLISHED', project_slug})", False, TEAL),
        (4, 3, 455, "7: lexical_hits + vector_hits", True, TEAL),
        (3, 1, 490, "8: fuse_rrf(k=60) -> ranked_hits[] + SourceCitation[]", True, TEAL),
        # Inside outer alt (Grounded = True)
        (1, 0, 575, "9: SSE event: citations (SourceCitation[doc_id, headers, score])", True, TEAL),
        (1, 5, 665, "10a: generate_stream(grounded_prompt) -> Proveedor Primario", False, NAVY),
        (5, 0, 705, "11a: SSE event: token (respuesta fundamentada con [doc_id])", True, TEAL),
        (1, 5, 765, "10b [Fallback BR-12]: ExtractiveFallbackLLMProvider.generate()", False, AMBER),
        (5, 0, 805, "11b: SSE event: token (síntesis extractiva local + aviso modo degradado)", True, AMBER),
        # Outer else (Grounded = False)
        (1, 0, 915, "12 [else Evidencia < umbral BR-08]: Abstención controlada (grounded=false, 0 alucinación)", True, "#B91C1C"),
        # Closing persistence & audit
        (1, 6, 1005, "13: save_chat_turn() + append_audit_log(SHA-256, latency_ms) + ws_notify()", False, SLATE),
        (6, 1, 1045, "14: Ack persistencia inmutable (AuditRecord confirmado)", True, SLATE),
        (1, 0, 1080, "15: SSE event: done (latency_ms, provider_name, trace_id)", True, NAVY),
    ]

    for s_idx, d_idx, my, mlabel, is_ret, mcol in messages:
        if s_idx != d_idx:
            b.add_edge(
                lifeline_ids[s_idx],
                lifeline_ids[d_idx],
                mlabel,
                points=[(centers[s_idx], my), (centers[d_idx], my)],
                dashed=is_ret,
                stroke=mcol,
                arrow="open" if is_ret else "block",
            )

    def seq_hook(draw: ImageDraw.ImageDraw, s: int, phase: str) -> None:
        if phase == "under":
            # Vertical dashed lifelines
            for cx in centers:
                b._draw_dashed_line(draw, (cx * s, 172 * s), (cx * s, 1105 * s), "#94A3B8", 2, 10 * s, 7 * s)
            # Divider inside inner alt (line y=735) and outer alt (line y=865)
            b._draw_dashed_line(draw, (285 * s, 735 * s), (1505 * s, 735 * s), AMBER, 2, 10 * s, 6 * s)
            f_guard = _load_font(10 * s, bold=True)
            draw.text((298 * s, 740 * s), "[else: Error de red / Timeout en LLM primario -> Conmutar Fallback BR-12]", fill=AMBER, font=f_guard)

            b._draw_dashed_line(draw, (45 * s, 865 * s), (1730 * s, 865 * s), "#B91C1C", 3, 12 * s, 6 * s)
            draw.text((60 * s, 873 * s), "[else: Ningún fragmento alcanza min_grounding_score -> Abstención Fundamentada]", fill="#B91C1C", font=f_guard)

            # Segmented activation bars on API/Facade (never crossing fragment banners)
            for ay1, ay2 in ((192, 245), (355, 512), (562, 608), (655, 726), (760, 822), (902, 952), (985, 1090)):
                draw.rectangle([(centers[1] - 5) * s, ay1 * s, (centers[1] + 5) * s, ay2 * s], fill="#DBEAFE", outline=NAVY, width=2)
        elif phase == "over":
            f_msg = _load_font(10 * s, bold=True)
            for s_idx, d_idx, my, mlabel, is_ret, mcol in messages:
                y_px = my * s
                if s_idx == d_idx:
                    x0 = centers[s_idx] * s
                    loop_w, loop_h = 44 * s, 22 * s
                    draw.line([(x0, y_px - 8 * s), (x0 + loop_w, y_px - 8 * s), (x0 + loop_w, y_px + loop_h), (x0, y_px + loop_h)], fill=mcol, width=3)
                    b._draw_arrowhead(draw, (x0 + loop_w, y_px + loop_h), (x0, y_px + loop_h), mcol, "block", s)
                    bb = draw.textbbox((0, 0), mlabel, font=f_msg)
                    tw, th = bb[2] - bb[0], bb[3] - bb[1]
                    draw.rounded_rectangle([x0 + loop_w + 6 * s, y_px - 4 * s, x0 + loop_w + tw + 16 * s, y_px + th + 4 * s], radius=4 * s, fill=WHITE, outline="#CBD5E1")
                    draw.text((x0 + loop_w + 11 * s, y_px - 1 * s), mlabel, fill=TEXT_DARK, font=f_msg)
                    continue

                x1, x2 = centers[s_idx] * s, centers[d_idx] * s
                if is_ret:
                    b._draw_dashed_line(draw, (x1, y_px), (x2, y_px), mcol, 3, 10 * s, 6 * s)
                    b._draw_arrowhead(draw, (x1, y_px), (x2, y_px), mcol, "open", s)
                else:
                    draw.line([(x1, y_px), (x2, y_px)], fill=mcol, width=3)
                    b._draw_arrowhead(draw, (x1, y_px), (x2, y_px), mcol, "block", s)

                mx = (x1 + x2) / 2.0
                bb = draw.textbbox((0, 0), mlabel, font=f_msg)
                tw, th = bb[2] - bb[0], bb[3] - bb[1]
                draw.rounded_rectangle(
                    [mx - tw / 2 - 6 * s, y_px - th - 9 * s, mx + tw / 2 + 6 * s, y_px - 3 * s],
                    radius=4 * s,
                    fill=WHITE,
                    outline="#CBD5E1",
                )
                draw.text((mx - tw / 2, y_px - th - 7 * s), mlabel, fill=TEXT_DARK, font=f_msg)

    return b.save_all("05_diagrama_secuencia_principal", custom_draw_hook=seq_hook)


# ============================================================================
# 6. NORMALIZED ENTITY-RELATIONSHIP DIAGRAM (ERD — 3NF)
# ============================================================================
def build_06_erd() -> tuple[Path, Path]:
    b = DrawioBuilder("erd_3nf", "Modelo Entidad-Relacion Normalizado - ContextForge", 1860, 1220)
    b.add_banner(
        "Modelo Entidad-Relación (ERD) Normalizado en 3FN — Persistencia ContextForge",
        "Esquema relacional consolidado (SQLite WAL / PostgreSQL) con claves primarias (PK), foráneas (FK), únicas (UK) y tipos SQL",
    )

    # 3x4 Grid with generous routing corridors
    # Row 1 (y=120)
    t_users = b.add_erd_table(
        45, 120, 385, 195, "users", "TO-BE RBAC",
        [
            ("PK", "user_id", "UUID"),
            ("UK", "email", "VARCHAR(150)"),
            ("", "full_name", "VARCHAR(120)"),
            ("", "password_hash", "VARCHAR(255)"),
            ("", "global_role", "VARCHAR(30)"),
            ("", "is_active", "BOOLEAN"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=PURPLE,
    )
    t_projects = b.add_erd_table(
        505, 120, 385, 210, "projects", "AS-IS + TO-BE",
        [
            ("PK", "slug", "VARCHAR(50)"),
            ("FK", "owner_id", "UUID"),
            ("", "name", "VARCHAR(100)"),
            ("UK", "path", "VARCHAR(255)"),
            ("", "sovereign_only", "BOOLEAN"),
            ("", "max_quota_mb", "INTEGER"),
            ("", "is_active", "BOOLEAN"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=NAVY,
    )
    t_modules = b.add_erd_table(
        965, 120, 385, 195, "modules_and_tags", "AS-IS Taxonomía",
        [
            ("PK", "id", "VARCHAR(64)"),
            ("FK", "project_slug", "VARCHAR(50)"),
            ("UK", "slug", "VARCHAR(100)"),
            ("", "kind", "VARCHAR(16)"),
            ("", "name", "VARCHAR(150)"),
            ("", "color", "VARCHAR(30)"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=NAVY,
    )
    t_apikeys = b.add_erd_table(
        1425, 120, 390, 195, "api_keys", "TO-BE Agentes MCP",
        [
            ("PK", "key_id", "UUID"),
            ("FK", "user_id", "UUID"),
            ("FK", "project_slug", "VARCHAR(50)"),
            ("UK", "key_sha256", "CHAR(64)"),
            ("", "role_scope", "VARCHAR(30)"),
            ("", "expires_at", "TIMESTAMPTZ"),
            ("", "revoked_at", "TIMESTAMPTZ"),
        ],
        header_fill=PURPLE,
    )

    # Row 2 (y=455)
    t_audit = b.add_erd_table(
        45, 455, 385, 225, "audit_logs", "TO-BE Append-Only",
        [
            ("PK", "log_id", "UUID"),
            ("FK", "actor_id", "UUID"),
            ("FK", "project_slug", "VARCHAR(50)"),
            ("", "operation", "VARCHAR(80)"),
            ("", "resource_id", "VARCHAR(120)"),
            ("", "succeeded", "BOOLEAN"),
            ("", "latency_ms", "FLOAT"),
            ("", "prev_hash", "CHAR(64)"),
            ("UK", "entry_hash", "CHAR(64)"),
        ],
        header_fill=SLATE,
    )
    t_books = b.add_erd_table(
        505, 455, 385, 240, "books", "AS-IS + TO-BE Core",
        [
            ("PK", "id", "VARCHAR(64)"),
            ("FK", "library_slug", "VARCHAR(50)"),
            ("FK", "module_id", "VARCHAR(64)"),
            ("", "slug", "VARCHAR(100)"),
            ("", "title", "VARCHAR(200)"),
            ("", "path", "VARCHAR(300)"),
            ("", "status", "VARCHAR(20)"),
            ("", "current_version", "INTEGER"),
            ("", "content_hash", "CHAR(64)"),
            ("", "updated_at", "TIMESTAMPTZ"),
        ],
        header_fill=TEAL,
    )
    t_versions = b.add_erd_table(
        965, 455, 385, 225, "document_versions", "TO-BE Historial",
        [
            ("PK", "version_id", "UUID"),
            ("FK", "book_id", "VARCHAR(64)"),
            ("FK", "author_id", "UUID"),
            ("", "version_number", "INTEGER"),
            ("", "content_markdown", "TEXT"),
            ("", "content_hash", "CHAR(64)"),
            ("", "status_snapshot", "VARCHAR(20)"),
            ("", "change_summary", "VARCHAR(250)"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=TEAL,
    )
    t_attach = b.add_erd_table(
        1425, 455, 390, 225, "attachments_and_jobs", "AS-IS + DLQ",
        [
            ("PK", "id", "UUID"),
            ("FK", "book_id", "VARCHAR(64)"),
            ("", "file_name", "VARCHAR(255)"),
            ("", "mime_type", "VARCHAR(100)"),
            ("", "size_bytes", "INTEGER"),
            ("", "sha256_checksum", "CHAR(64)"),
            ("", "index_job_status", "VARCHAR(20)"),
            ("", "retry_attempts", "INTEGER"),
            ("", "uploaded_at", "TIMESTAMPTZ"),
        ],
        header_fill=AMBER,
    )

    # Row 3 (y=835)
    t_llm = b.add_erd_table(
        45, 835, 385, 225, "llm_configurations", "AS-IS + AES-GCM",
        [
            ("PK", "provider", "VARCHAR(50)"),
            ("", "engine_type", "VARCHAR(40)"),
            ("", "base_url", "VARCHAR(255)"),
            ("", "api_key_cipher", "BYTEA / TEXT"),
            ("", "default_model", "VARCHAR(100)"),
            ("", "temperature", "FLOAT"),
            ("", "max_tokens", "INTEGER"),
            ("", "is_active", "BOOLEAN"),
            ("", "updated_at", "TIMESTAMPTZ"),
        ],
        header_fill=INDIGO,
    )
    t_chat = b.add_erd_table(
        505, 835, 385, 225, "chat_sessions_messages", "AS-IS RAG Chat",
        [
            ("PK", "message_id", "VARCHAR(64)"),
            ("FK", "session_id", "VARCHAR(64)"),
            ("FK", "project_slug", "VARCHAR(50)"),
            ("FK", "book_id", "VARCHAR(64)"),
            ("FK", "user_id", "UUID"),
            ("", "role", "VARCHAR(20)"),
            ("", "content", "TEXT"),
            ("", "sources_json", "JSONB / TEXT"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=NAVY,
    )
    t_bundles = b.add_erd_table(
        965, 835, 385, 225, "context_bundles_items", "TO-BE Manifiesto",
        [
            ("PK", "bundle_id", "UUID"),
            ("FK", "project_slug", "VARCHAR(50)"),
            ("FK", "book_id", "VARCHAR(64)"),
            ("", "name", "VARCHAR(150)"),
            ("", "export_format", "VARCHAR(20)"),
            ("", "max_tokens", "INTEGER"),
            ("", "estimated_tokens", "INTEGER"),
            ("", "version_included", "INTEGER"),
            ("", "bundle_hash", "CHAR(64)"),
        ],
        header_fill=TEAL,
    )
    t_social = b.add_erd_table(
        1425, 835, 390, 225, "threads_comments_ratings", "3FN Consolidado",
        [
            ("PK", "comment_id", "UUID"),
            ("FK", "thread_id", "UUID"),
            ("FK", "book_id", "VARCHAR(64)"),
            ("FK", "author_id", "UUID"),
            ("", "section_anchor", "VARCHAR(150)"),
            ("", "content", "TEXT"),
            ("", "resolved", "BOOLEAN"),
            ("", "rating_score", "SMALLINT (1..5)"),
            ("", "created_at", "TIMESTAMPTZ"),
        ],
        header_fill=INDIGO,
    )

    # Orthogonal FK relationships through clear corridors (y=385 and y=765)
    b.add_edge(t_users, t_projects, "posee", start_label="1", end_label="0..*", stroke=PURPLE)
    b.add_edge(t_users, t_audit, "ejecuta", start_label="1", end_label="0..*", stroke=SLATE)
    b.add_edge(t_users, t_apikeys, "emite", points=[(237, 98), (1620, 98)], start_label="1", end_label="0..*", stroke=PURPLE)

    b.add_edge(t_projects, t_modules, "clasifica", start_label="1", end_label="0..*", stroke=NAVY)
    b.add_edge(t_projects, t_apikeys, "acota", points=[(780, 375), (1620, 375)], start_label="1", end_label="0..*", stroke=PURPLE)
    b.add_edge(t_projects, t_books, "contiene", start_label="1", end_label="0..*", stroke=NAVY)
    b.add_edge(t_modules, t_books, "agrupa", points=[(1157, 395), (760, 395)], start_label="1", end_label="0..*", stroke=NAVY)

    b.add_edge(t_books, t_versions, "versiona", start_label="1", end_label="1..*", stroke=TEAL)
    b.add_edge(t_books, t_attach, "adjunta / indexa", points=[(840, 745), (1620, 745)], start_label="1", end_label="0..*", stroke=AMBER)
    b.add_edge(t_books, t_chat, "contextualiza", start_label="0..1", end_label="0..*", stroke=NAVY)
    b.add_edge(t_books, t_bundles, "empaqueta", points=[(760, 775), (1157, 775)], start_label="1", end_label="0..*", stroke=TEAL)
    b.add_edge(t_books, t_social, "discute / califica", points=[(800, 795), (1620, 795)], start_label="1", end_label="0..*", stroke=INDIGO)

    return b.save_all("06_diagrama_entidad_relacion_erd")


def main() -> None:
    builders = [
        build_01_c4_context,
        build_02_c4_containers,
        build_03_use_cases,
        build_04_domain_classes,
        build_05_sequence,
        build_06_erd,
    ]
    for fn in builders:
        d_path, p_path = fn()
        # Validate XML parseability immediately
        ET.parse(d_path)
        with Image.open(p_path) as im:
            print(f"OK: {d_path.name} ({d_path.stat().st_size:,} B) -> {p_path.name} ({im.size[0]}x{im.size[1]} px, {p_path.stat().st_size:,} B)")


if __name__ == "__main__":
    main()
