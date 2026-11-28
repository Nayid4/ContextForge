"""E2E verification of restored Claude-style rich UI design and 100% functional parity."""

from __future__ import annotations

import re
from fastapi.testclient import TestClient

from main import create_app

EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF]")


def test_restored_rich_ui_views_and_feature_parity() -> None:
    app = create_app()
    with TestClient(app) as client:
        # 1. Verify rich base layout, sidebar, Ctrl+K, FilePreviewModal & ScopedChatDrawer across all views
        browser = client.get("/docs/browser")
        assert browser.status_code == 200
        assert "cf-global-progress" in browser.text
        assert "command-palette-modal" in browser.text
        assert "cf-file-preview-modal" in browser.text
        assert "cf-scoped-chat-drawer" in browser.text
        assert "Editorial Workspace" not in browser.text
        assert not EMOJI_RE.search(browser.text)

        # 2. Document detail view with auto-TOC, Scoped Chat, Version History & Rating
        detail = client.get("/docs/view/arch_retries.md?project=default")
        assert detail.status_code == 200
        assert "cf-doc-article" in detail.text and "cf-versions-modal" in detail.text

        # 3. 3-Mode Editor (Markdown + Visual WYSIWYG + Blocks) & Bidirectional Parse/Compile API
        editor = client.get("/books/editor?path=arch_retries.md&project=default")
        assert editor.status_code == 200
        assert "dualEditorApp()" in editor.text and "Bloques" in editor.text
        assert "cf-wysiwyg-surface" in editor.text and "Documento vacío." in editor.text
        assert "editor_wysiwyg_mixin.js" in editor.text
        assert "Paleta personalizada" in editor.text and 'type="color"' in editor.text and "Limpiar" in editor.text

        parsed = client.post("/api/v1/books/parse-markdown", json={"raw_markdown": "# Titulo\n\nParrafo de prueba\n\n```mermaid\nflowchart LR\nA-->B\n```"})
        assert parsed.status_code == 200 and len(parsed.json()["blocks"]) == 3

        compiled = client.post(
            "/api/v1/books/compile-blocks",
            json={"title": "Demo", "module": "architecture", "library_id": "default", "tags": ["sdd"], "blocks": parsed.json()["blocks"]},
        )
        assert compiled.status_code == 200 and "```mermaid" in compiled.json()["raw_markdown"]

        # 4. Scoped Document Chat (ScopedChatDrawer backend)
        scoped = client.post(
            "/api/v1/rag/scoped",
            json={"question": "Resume este documento", "document_title": "Reintentos", "document_path": "arch_retries.md", "content_markdown": "Usamos backoff exponencial de 5 intentos."},
        )
        assert scoped.status_code == 200 and "answer" in scoped.json()

        # 5. Context Bundler 2-Tab UI + Agent CLI Rules Sync (CLAUDE.md, .cursorrules, AGENTS.md)
        bundler = client.get("/bundles")
        assert bundler.status_code == 200 and "agentRulesSyncApp" in bundler.text and "Cursor IDE" in bundler.text

        rules_sync = client.post(
            "/api/v1/bundles/export-agent-rules",
            json={"project_slug": "default", "targets": ["CLAUDE.md", ".cursorrules", "AGENTS.md"], "write_to_project_root": False},
        )
        assert rules_sync.status_code == 200 and len(rules_sync.json()["files"]) == 3

        # 6. Settings UI (4 tabs: LLM, RAG, DB/Storage, Security RBAC/Audit) + CLI Discovery + Storage Test
        settings_pg = client.get("/settings")
        assert settings_pg.status_code == 200 and "llmSettingsApp()" in settings_pg.text and "Seguridad RBAC" in settings_pg.text

        cli_disc = client.get("/api/v1/settings/llm/discover-cli")
        assert cli_disc.status_code == 200 and cli_disc.json()["total_checked"] == 7
        assert any(e["provider"] == "antigravity_cli" and e["binary"] == "agy" for e in cli_disc.json()["engines"])

        st_test = client.post("/api/v1/settings/storage/test", json={"provider": "local_fs", "base_path": "./data/storage"})
        assert st_test.status_code == 200 and st_test.json()["healthy"] is True

        # 7. Integration Guide + Postman v2.1 Collection + Embeddable Widget JS + MCP /mcp/info
        guide = client.get("/docs/integration-guide")
        assert guide.status_code == 200 and "integrationDocsApp" in guide.text

        postman = client.get("/api/v1/integrations/postman-collection")
        assert postman.status_code == 200 and postman.json()["info"]["schema"].endswith("v2.1.0/collection.json")

        widget_js = client.get("/static/js/contextforge-chat-widget.js")
        assert widget_js.status_code == 200 and "ContextForgeChat" in widget_js.text

        mcp_info = client.get("/mcp/info")
        assert mcp_info.status_code == 200 and len(mcp_info.json()["tools"]) == 3

        # 8. HTMX Navbar Project Selector & Projects Page (zero broken x-data quotes)
        nav_sel = client.get("/ui/projects/navbar-selector")
        assert nav_sel.status_code == 200 and "global-project-select" in nav_sel.text
        assert 'x-data="cfComboboxApp()"' in nav_sel.text
        assert "p.slug === this.activeSlug" not in nav_sel.text
        assert 'x-data="cfComboboxApp()"' in browser.text
        assert 'x-data="cfComboboxApp()"' in bundler.text
