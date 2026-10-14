"""E2E / API integration tests for documentation scaffolding and blueprints."""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.mark.asyncio
async def test_scaffold_api_endpoints() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get templates catalog
        templates_res = await client.get("/api/v1/docs/templates")
        assert templates_res.status_code == 200
        templates = templates_res.json()
        assert len(templates) >= 4

        template_ids = [t["id"] for t in templates]
        assert "adr" in template_ids
        assert "business_flow" in template_ids
        assert "api_integration" in template_ids
        assert "troubleshooting" in template_ids

        # 2. Scaffold doc via API (use_ai=False to ensure fast deterministic local execution)
        create_res = await client.post(
            "/api/v1/docs/scaffold-ai",
            json={
                "project_slug": "iuristrack",
                "template_id": "adr",
                "title": "Adopción de Arquitectura Hexagonal",
                "context_description": "Desacoplar la lógica de dominio jurídico de los adaptadores de persistencia.",
                "module": "architecture",
                "author": "Tech Lead",
                "use_ai": False,
            },
        )
        assert create_res.status_code == 201
        data = create_res.json()
        assert data["project_slug"] == "iuristrack"
        assert "Adopción de Arquitectura Hexagonal" in data["title"]
        assert "```mermaid" in data["content_markdown"]
        assert data["module"] == "architecture"

        # 3. Verify the document is retrievable via docs-api
        doc_path = data["path"]
        get_res = await client.get(f"/api/v1/docs-api/{doc_path}?project=iuristrack")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == data["title"]

