"""GitHub-Flavored Markdown (GFM) renderer supporting tables, task lists, footnotes, and GitHub Alert callouts."""

from __future__ import annotations

import re
import marko


class RichMarkdownRenderer:
    """Stateless GFM Markdown-to-HTML renderer with callout cards and responsive table wrappers."""

    _MARKO_ALERT_RE = re.compile(
        r'<blockquote class="alert alert-(note|tip|important|warning|caution)">\s*<p>[^<]*</p>\s*(.*?)</blockquote>',
        re.IGNORECASE | re.DOTALL,
    )
    _ALERT_RE = re.compile(
        r"<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*/?>|\n)?(.*?)</p>(.*?)</blockquote>",
        re.IGNORECASE | re.DOTALL,
    )
    _TABLE_RE = re.compile(r"(<table\b[^>]*>.*?</table>)", re.IGNORECASE | re.DOTALL)
    _ALERT_LABELS: dict[str, str] = {
        "NOTE": "Nota",
        "TIP": "Consejo",
        "IMPORTANT": "Importante",
        "WARNING": "Advertencia",
        "CAUTION": "Precaución",
    }

    _md = marko.Markdown(extensions=["gfm", "footnote"])

    @classmethod
    def render(cls, content_markdown: str) -> str:
        if not content_markdown or not content_markdown.strip():
            return ""
        html = str(cls._md.convert(content_markdown))

        def _replace_marko_alert(match: re.Match[str]) -> str:
            kind = match.group(1).upper()
            body = match.group(2).strip()
            label = cls._ALERT_LABELS.get(kind, kind.title())
            return (
                f'<div class="cf-callout cf-callout-{kind.lower()}">'
                f'<div class="cf-callout-title">{label}</div>'
                f'<div class="cf-callout-body">{body}</div>'
                f"</div>"
            )

        def _replace_alert(match: re.Match[str]) -> str:
            kind = match.group(1).upper()
            first_para = match.group(2).strip()
            rest = match.group(3).strip()
            label = cls._ALERT_LABELS.get(kind, kind.title())
            body = f"<p>{first_para}</p>{rest}" if first_para else rest
            return (
                f'<div class="cf-callout cf-callout-{kind.lower()}">'
                f'<div class="cf-callout-title">{label}</div>'
                f'<div class="cf-callout-body">{body}</div>'
                f"</div>"
            )

        html = cls._MARKO_ALERT_RE.sub(_replace_marko_alert, html)
        html = cls._ALERT_RE.sub(_replace_alert, html)
        html = cls._TABLE_RE.sub(r'<div class="cf-table-wrap">\1</div>', html)
        return html
