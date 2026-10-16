"""Integrations REST API v1 Router.

Provides:
- Dynamic Postman Collection v2.1.0 generator with automated test scripts and environment variables.
- Direct distribution endpoint for the Embeddable Floating Chatbot Widget (`widget.js`).
- System health diagnostic endpoint (`/health`).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from fastapi import APIRouter, Query, Response
from fastapi.responses import JSONResponse

router = APIRouter(tags=["Integrations & Tooling"])


def build_postman_collection(base_url: str = "http://localhost:8000", default_project: str = "default") -> dict[str, Any]:
    """Construct a full Postman Collection v2.1.0 specification covering all ContextForge subsystems."""
    return {
        "info": {
            "_postman_id": "cf-collection-v2-complete",
            "name": "ContextForge Multi-Tenant API & MCP Hub",
            "description": (
                "Colección oficial de endpoints REST, SSE Streaming y Diagnóstico de ContextForge.\n\n"
                "Incluye variables de colección dinámicas (`baseUrl`, `project_slug`, `doc_path`), "
                "scripts de prueba automatizados para verificar estados HTTP, y scripts para capturar valores entre peticiones."
            ),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "variable": [
            {"key": "baseUrl", "value": base_url, "type": "string"},
            {"key": "project_slug", "value": default_project, "type": "string"},
            {"key": "doc_path", "value": "architecture/adrs/001_event_driven_payments.md", "type": "string"},
            {"key": "active_llm_provider", "value": "gemini", "type": "string"},
            {"key": "sample_query", "value": "¿Cuál es la política de reintentos en pagos y webhooks?", "type": "string"},
        ],
        "item": [
            # Folder 1: Health & Diagnóstico
            {
                "name": "01. Health & Diagnóstico",
                "item": [
                    {
                        "name": "Health Check Principal",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/health",
                                "host": ["{{baseUrl}}"],
                                "path": ["health"],
                            },
                            "description": "Verifica que el servidor FastAPI, base de datos y motores estén operativos.",
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Status code is 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                        "pm.test('Service status is healthy', function () {",
                                        "    var jsonData = pm.response.json();",
                                        "    pm.expect(jsonData.status).to.eql('healthy');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Estado Servidor MCP Universal",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/mcp/info",
                                "host": ["{{baseUrl}}"],
                                "path": ["mcp", "info"],
                            },
                            "description": "Reporta las herramientas y recursos MCP registrados (search_project_context, etc.).",
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('MCP Server Status is 200', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                        "pm.test('MCP tools listed', function () {",
                                        "    var jsonData = pm.response.json();",
                                        "    pm.expect(jsonData.tools).to.be.an('array');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
            # Folder 2: Proyectos y Librerías Multi-Tenant
            {
                "name": "02. Multi-Tenant Librerías & Proyectos",
                "item": [
                    {
                        "name": "Listar Proyectos (Paginados y Filtrados)",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "text/html", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/projects?page=1&per_page=6&q=",
                                "host": ["{{baseUrl}}"],
                                "path": ["projects"],
                                "query": [
                                    {"key": "page", "value": "1"},
                                    {"key": "per_page", "value": "6"},
                                    {"key": "q", "value": ""},
                                ],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Projects view response 200', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Registrar Nueva Librería / Proyecto",
                        "request": {
                            "method": "POST",
                            "header": [
                                {"key": "Content-Type", "value": "application/x-www-form-urlencoded", "type": "text"}
                            ],
                            "body": {
                                "mode": "urlencoded",
                                "urlencoded": [
                                    {"key": "name", "value": "Billing Core Engine", "type": "text"},
                                    {"key": "slug", "value": "billing-core", "type": "text"},
                                    {"key": "description", "value": "Arquitectura de pagos y conciliación bancaria", "type": "text"},
                                    {"key": "make_active", "value": "true", "type": "text"},
                                ],
                            },
                            "url": {
                                "raw": "{{baseUrl}}/projects/new",
                                "host": ["{{baseUrl}}"],
                                "path": ["projects", "new"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Project created or redirected (200, 302, 303)', function () {",
                                        "    pm.expect(pm.response.code).to.be.oneOf([200, 302, 303]);",
                                        "});",
                                        "pm.collectionVariables.set('project_slug', 'billing-core');",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Cambiar Librería Activa Global",
                        "request": {
                            "method": "POST",
                            "header": [
                                {"key": "Content-Type", "value": "application/x-www-form-urlencoded", "type": "text"}
                            ],
                            "body": {
                                "mode": "urlencoded",
                                "urlencoded": [
                                    {"key": "project_slug", "value": "{{project_slug}}", "type": "text"}
                                ],
                            },
                            "url": {
                                "raw": "{{baseUrl}}/ui/projects/switch",
                                "host": ["{{baseUrl}}"],
                                "path": ["ui", "projects", "switch"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Switched project successfully', function () {",
                                        "    pm.expect(pm.response.code).to.be.oneOf([200, 302, 303]);",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
            # Folder 3: Chat RAG & Streaming SSE
            {
                "name": "03. Chat RAG & Streaming SSE",
                "item": [
                    {
                        "name": "RAG Grounded Q&A (Respuesta Consolidada + Citas)",
                        "request": {
                            "method": "POST",
                            "header": [
                                {"key": "Content-Type", "value": "application/json", "type": "text"},
                                {"key": "Accept", "value": "application/json", "type": "text"},
                            ],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "query": "{{sample_query}}",
                                        "project": "{{project_slug}}",
                                        "top_k": 4,
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/rag/ask",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "rag", "ask"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('RAG Query responds 200', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                        "pm.test('Response includes answer and citations', function () {",
                                        "    var data = pm.response.json();",
                                        "    pm.expect(data.answer).to.be.a('string');",
                                        "    pm.expect(data.citations).to.be.an('array');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Streaming RAG en Tiempo Real (Server-Sent Events)",
                        "request": {
                            "method": "GET",
                            "header": [
                                {"key": "Accept", "value": "text/event-stream", "type": "text"}
                            ],
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/rag/stream?q={{sample_query}}&project={{project_slug}}&top_k=4",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "rag", "stream"],
                                "query": [
                                    {"key": "q", "value": "{{sample_query}}"},
                                    {"key": "project", "value": "{{project_slug}}"},
                                    {"key": "top_k", "value": "4"},
                                ],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Status is 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                        "pm.test('Content-Type is text/event-stream', function () {",
                                        "    pm.expect(pm.response.headers.get('Content-Type')).to.include('text/event-stream');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Chat de Proyecto Multi-Documento",
                        "request": {
                            "method": "POST",
                            "header": [
                                {"key": "Content-Type", "value": "application/json", "type": "text"}
                            ],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "project_slug": "{{project_slug}}",
                                        "question": "Resume los puntos principales de la arquitectura",
                                        "provider_override": "gemini",
                                        "top_k": 3,
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/chat/project",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "chat", "project"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Chat project 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
            # Folder 4: Configuración Universal (LLMs, Base de Datos, Storage)
            {
                "name": "04. Configuración Universal (LLM, DB, Storage)",
                "item": [
                    {
                        "name": "Obtener Proveedores y LLM Activo",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/settings/llm",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "settings", "llm"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('LLM Settings 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "});",
                                        "var json = pm.response.json();",
                                        "if (json.active_provider) {",
                                        "    pm.collectionVariables.set('active_llm_provider', json.active_provider);",
                                        "}",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Probar Conectividad de LLM (Ollama, Gemini, OpenAI)",
                        "request": {
                            "method": "POST",
                            "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "provider": "ollama",
                                        "base_url": "http://localhost:11434",
                                        "default_model": "llama3.1:8b",
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/settings/llm/test",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "settings", "llm", "test"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('LLM Test response received', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "    var json = pm.response.json();",
                                        "    pm.expect(json).to.have.property('healthy');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Probar Conexión de Base de Datos (Strategy Pattern)",
                        "request": {
                            "method": "POST",
                            "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "provider": "sqlite",
                                        "database_name": "contextforge",
                                        "connection_url": "sqlite+aiosqlite:///./data/contextforge.db",
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/settings/database/test",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "settings", "database", "test"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('DB Test executed successfully', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "    var json = pm.response.json();",
                                        "    pm.expect(json.healthy).to.be.true;",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Probar Almacenamiento (Template Method Pattern)",
                        "request": {
                            "method": "POST",
                            "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "provider": "local_fs",
                                        "base_path": "./docs",
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/settings/storage/test",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "settings", "storage", "test"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Storage test response 200', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "    var json = pm.response.json();",
                                        "    pm.expect(json.healthy).to.be.true;",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
            # Folder 5: Taxonomía de Ingeniería (Módulos & Tags)
            {
                "name": "05. Taxonomía de Ingeniería (Módulos & Tags)",
                "item": [
                    {
                        "name": "Listar Módulos Técnicos",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/taxonomy/modules",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "taxonomy", "modules"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Taxonomy modules 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "    var data = pm.response.json();",
                                        "    pm.expect(data).to.be.an('array');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                    {
                        "name": "Listar Tags Técnicos",
                        "request": {
                            "method": "GET",
                            "header": [{"key": "Accept", "value": "application/json", "type": "text"}],
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/taxonomy/tags",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "taxonomy", "tags"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Taxonomy tags 200 OK', function () {",
                                        "    pm.response.to.have.status(200);",
                                        "    var data = pm.response.json();",
                                        "    pm.expect(data).to.be.an('array');",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
            # Folder 6: Bundler y Sincronización de Reglas
            {
                "name": "06. Context Bundler & Reglas de Agentes",
                "item": [
                    {
                        "name": "Exportar Reglas (CLAUDE.md, .cursorrules, AGENTS.md)",
                        "request": {
                            "method": "POST",
                            "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
                            "body": {
                                "mode": "raw",
                                "raw": json.dumps(
                                    {
                                        "project_slug": "{{project_slug}}",
                                        "targets": ["CLAUDE.md", ".cursorrules", "AGENTS.md"],
                                        "write_to_project_root": False,
                                    },
                                    indent=2,
                                ),
                                "options": {"raw": {"language": "json"}},
                            },
                            "url": {
                                "raw": "{{baseUrl}}/api/v1/bundles/export-agent-rules",
                                "host": ["{{baseUrl}}"],
                                "path": ["api", "v1", "bundles", "export-agent-rules"],
                            },
                        },
                        "event": [
                            {
                                "listen": "test",
                                "script": {
                                    "type": "text/javascript",
                                    "exec": [
                                        "pm.test('Rules exported successfully', function () {",
                                        "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
                                        "});",
                                    ],
                                },
                            }
                        ],
                    },
                ],
            },
        ],
    }


@router.get("/health", summary="Health check endpoint for external monitoring & Postman")
async def health_check() -> dict[str, Any]:
    """Health diagnostic endpoint confirming service availability."""
    return {
        "status": "healthy",
        "service": "ContextForge",
        "version": "1.0.0",
        "mcp_enabled": True,
        "rag_engine": "ChromaDB + BM25",
    }


@router.get("/api/v1/integrations/postman-collection", summary="Download official Postman Collection JSON")
async def get_postman_collection(
    base_url: str = Query(default="http://localhost:8000", description="Base host URL for Postman collection"),
    project: str = Query(default="default", description="Active project slug to pre-configure"),
) -> Response:
    """Generate and download the official Postman Collection v2.1.0 JSON format."""
    collection = build_postman_collection(base_url=base_url, default_project=project)
    content = json.dumps(collection, indent=2, ensure_ascii=False)
    headers = {
        "Content-Disposition": 'attachment; filename="ContextForge.postman_collection.json"',
        "Content-Type": "application/json; charset=utf-8",
    }
    return Response(content=content, media_type="application/json", headers=headers)


@router.get("/api/v1/integrations/widget.js", summary="Download or link embeddable Floating Chatbot Widget")
async def get_embeddable_widget_script() -> Response:
    """Serve the standalone embeddable chat widget script."""
    widget_path = Path("src/presentation/frontend/shared/assets/js/contextforge-chat-widget.js")
    if widget_path.exists():
        content = widget_path.read_text(encoding="utf-8")
    else:
        content = "// ContextForge Widget script placeholder"
    return Response(content=content, media_type="application/javascript")

