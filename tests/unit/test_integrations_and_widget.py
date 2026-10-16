"""Tests for Integration Hub: Postman Collection Generator, Embeddable Chatbot Widget,
and Architecture Integration Guide.
"""

from __future__ import annotations

import json
from typing import Any
from fastapi.testclient import TestClient

from main import app
from presentation.api.v1.integrations_api import build_postman_collection


def test_postman_collection_builder_structure() -> None:
    """Verify build_postman_collection adheres strictly to Postman v2.1.0 specification."""
    collection = build_postman_collection(
        base_url="https://api.contextforge.dev",
        default_project="ecommerce-core",
    )

    # Info & Schema
    assert collection["info"]["_postman_id"] == "cf-collection-v2-complete"
    assert "ContextForge" in collection["info"]["name"]
    assert collection["info"]["schema"] == "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"

    # Collection Variables
    variables = {v["key"]: v["value"] for v in collection["variable"]}
    assert variables["baseUrl"] == "https://api.contextforge.dev"
    assert variables["project_slug"] == "ecommerce-core"
    assert "doc_path" in variables
    assert "sample_query" in variables

    # Folders (Items)
    folder_names = [item["name"] for item in collection["item"]]
    assert any("Health & Diagnóstico" in name for name in folder_names)
    assert any("Multi-Tenant" in name for name in folder_names)
    assert any("Chat RAG" in name for name in folder_names)
    assert any("Configuración Universal" in name for name in folder_names)
    assert any("Taxonomía" in name for name in folder_names)
    assert any("Context Bundler" in name for name in folder_names)

    # Check automated test scripts exist in requests
    rag_folder = next(item for item in collection["item"] if "Chat RAG" in item["name"])
    assert len(rag_folder["item"]) >= 2
    ask_req = rag_folder["item"][0]
    assert "RAG" in ask_req["name"]
    assert len(ask_req["event"]) > 0
    script_exec = ask_req["event"][0]["script"]["exec"]
    script_text = " ".join(script_exec)
    assert "pm.response.to.have.status(200)" in script_text
    assert "data.answer" in script_text


def test_postman_collection_http_endpoint() -> None:
    """Verify GET /api/v1/integrations/postman-collection returns downloadable JSON."""
    client = TestClient(app)
    response = client.get("/api/v1/integrations/postman-collection?base_url=http://127.0.0.1:8000&project=billing-service")

    assert response.status_code == 200
    assert "application/json" in response.headers.get("Content-Type", "")
    assert 'filename="ContextForge.postman_collection.json"' in response.headers.get("Content-Disposition", "")

    data: dict[str, Any] = response.json()
    assert data["info"]["schema"] == "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    vars_map = {v["key"]: v["value"] for v in data["variable"]}
    assert vars_map["project_slug"] == "billing-service"
    assert vars_map["baseUrl"] == "http://127.0.0.1:8000"


def test_embeddable_widget_script_endpoint() -> None:
    """Verify GET /api/v1/integrations/widget.js serves the Shadow DOM floating widget script."""
    client = TestClient(app)
    response = client.get("/api/v1/integrations/widget.js")

    assert response.status_code == 200
    assert "application/javascript" in response.headers.get("Content-Type", "")
    js_text = response.text
    assert "ContextForgeChat" in js_text
    assert "contextforge-chat-widget" in js_text
    assert "attachShadow" in js_text
    assert "data-project" in js_text
    assert "EventSource" in js_text
    assert "window.ContextForgeChat" in js_text


def test_system_health_check_endpoint() -> None:
    """Verify GET /health provides system diagnostics for monitoring & Postman test scripts."""
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    data: dict[str, Any] = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ContextForge"
    assert data["mcp_enabled"] is True


def test_integration_guide_view_rendering() -> None:
    """Verify GET /docs/integration-guide renders the architecture diagram, Postman links, and widget docs."""
    client = TestClient(app)
    response = client.get("/docs/integration-guide")

    assert response.status_code == 200
    html = response.text
    assert "Guía de Integración" in html
    assert "ContextForge.postman_collection.json" in html
    assert "contextforge-chat-widget.js" in html
    assert "mermaid" in html
    assert "newman run" in html
    assert "Probar Widget en Vivo" in html
