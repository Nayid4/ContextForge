"""Generates an importable Postman Collection v2.1 JSON covering ALL ContextForge v2.0 REST, OpenAI, Agents, Webhooks, Health & MCP endpoints."""

from __future__ import annotations

from typing import Any


class PostmanCollectionBuilder:
    @staticmethod
    def build(base_url: str = "http://127.0.0.1:8000", project_slug: str = "default", agent_slug: str = "assistant") -> dict[str, Any]:
        return {
            "info": {
                "name": f"ContextForge API v2.0 ({project_slug})",
                "description": (
                    "Colección completa y sin credenciales hardcodeadas: Auth RBAC, Proyectos y Miembros (BR-23), "
                    "Documentos/Versiones/Draft-Revision/Sync-Resolve, Agentes/Evals, Gateway OpenAI (/v1/*), "
                    "Widget Seguro (cf_pub_*), Salud/Vacíos/Feedback (BR-24), Webhooks HTTPS/HMAC, Export/Import, Auditoría, /metrics y MCP."
                ),
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            },
            "variable": [
                {"key": "baseUrl", "value": base_url.rstrip("/")},
                {"key": "project_slug", "value": project_slug},
                {"key": "agent_slug", "value": agent_slug},
                {"key": "doc_path", "value": "guides/ejemplo.md"},
                {"key": "admin_email", "value": "admin@contextforge.local"},
                {"key": "admin_password", "value": ""},
                {"key": "access_token", "value": ""},
                {"key": "api_key", "value": ""},
                {"key": "publishable_key", "value": ""},
            ],
            "item": [
                {
                    "name": "01. Health, Auth RBAC & Team Users",
                    "item": [
                        {"name": "Health Ready", "request": {"method": "GET", "url": "{{baseUrl}}/health/ready"}},
                        {
                            "name": "Login JWT",
                            "request": {
                                "method": "POST",
                                "header": [{"key": "Content-Type", "value": "application/json"}],
                                "url": "{{baseUrl}}/api/v1/auth/login",
                                "body": {"mode": "raw", "raw": '{"email":"{{admin_email}}","password":"{{admin_password}}"}'},
                            },
                        },
                        {
                            "name": "Change Password (Mandatory Rotation)",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Authorization", "value": "Bearer {{access_token}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/auth/change-password",
                                "body": {"mode": "raw", "raw": '{"current_password":"{{admin_password}}","new_password":"NuevaPasswordSegura1!"}'},
                            },
                        },
                        {
                            "name": "Issue Scoped API Key (cf_live_* or cf_pub_*)",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Authorization", "value": "Bearer {{access_token}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/auth/api-keys",
                                "body": {
                                    "mode": "raw",
                                    "raw": '{"name":"Widget Portal","role_scope":"AgentClient","allowed_projects":["{{project_slug}}"],"is_publishable":true,"allowed_origins":["https://mi-app.ejemplo.com"],"allowed_agents":["{{project_slug}}/{{agent_slug}}"],"daily_quota_requests":1000}',
                                },
                            },
                        },
                        {
                            "name": "Verify Audit Chain SHA-256 (BR-14)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/audit-logs/verify",
                            },
                        },
                        {
                            "name": "Prometheus /metrics (Admin)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/metrics",
                            },
                        },
                    ],
                },
                {
                    "name": "02. OpenAI-Compatible Gateway (/v1/*)",
                    "item": [
                        {
                            "name": "List Authorized Agents (/v1/models)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{api_key}}"}],
                                "url": "{{baseUrl}}/v1/models",
                            },
                        },
                        {
                            "name": "Chat Completions (/v1/chat/completions)",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Authorization", "value": "Bearer {{api_key}}"},
                                ],
                                "url": "{{baseUrl}}/v1/chat/completions",
                                "body": {
                                    "mode": "raw",
                                    "raw": '{"model":"{{project_slug}}/{{agent_slug}}","stream":false,"messages":[{"role":"user","content":"¿Cuáles son las reglas clave del proyecto?"}]}',
                                },
                            },
                        },
                    ],
                },
                {
                    "name": "03. Project Agents, Evals & Ephemeral Widget",
                    "item": [
                        {
                            "name": "List Project Agents",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "X-API-Key", "value": "{{api_key}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/agents",
                            },
                        },
                        {
                            "name": "Chat with Specific Agent",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "X-API-Key", "value": "{{api_key}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/agents/{{agent_slug}}/chat",
                                "body": {"mode": "raw", "raw": '{"question":"Resume las decisiones de arquitectura"}'},
                            },
                        },
                        {
                            "name": "Run Agent Eval Suite",
                            "request": {
                                "method": "POST",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/agents/{{agent_slug}}/evals/run",
                            },
                        },
                        {
                            "name": "Exchange Publishable Key for Widget Ephemeral JWT (BR-18)",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Origin", "value": "https://mi-app.ejemplo.com"},
                                ],
                                "url": "{{baseUrl}}/api/v1/widget/session",
                                "body": {"mode": "raw", "raw": '{"publishable_key":"{{publishable_key}}","project_slug":"{{project_slug}}","agent_slug":"{{agent_slug}}"}'},
                            },
                        },
                    ],
                },
                {
                    "name": "04. Documents, Governance & 3-Way Sync",
                    "item": [
                        {
                            "name": "List Project Documents",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "X-API-Key", "value": "{{api_key}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/documents?page=1&page_size=12",
                            },
                        },
                        {
                            "name": "Get Document Detail + ETag",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "X-API-Key", "value": "{{api_key}}"}],
                                "url": "{{baseUrl}}/api/v1/documents/detail?path={{doc_path}}&project={{project_slug}}",
                            },
                        },
                        {
                            "name": "Update Document Steward & Freshness (BR-24)",
                            "request": {
                                "method": "PATCH",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Authorization", "value": "Bearer {{access_token}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/documents/governance",
                                "body": {"mode": "raw", "raw": '{"path":"{{doc_path}}","review_interval_days":90,"mark_reviewed":true}'},
                            },
                        },
                    ],
                },
                {
                    "name": "05. Knowledge Health, Gaps, Feedback, Members & Webhooks",
                    "item": [
                        {
                            "name": "Project Knowledge Health Dashboard (BR-24)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/knowledge-health",
                            },
                        },
                        {
                            "name": "List Knowledge Gaps",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/knowledge-gaps?status=open",
                            },
                        },
                        {
                            "name": "Submit Answer Feedback",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "X-API-Key", "value": "{{api_key}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/feedback",
                                "body": {"mode": "raw", "raw": '{"agent_slug":"{{agent_slug}}","question":"Pregunta ejemplo","vote":"up"}'},
                            },
                        },
                        {
                            "name": "List Project Members (BR-23)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/members",
                            },
                        },
                        {
                            "name": "Create HTTPS Signed Webhook (BR-22)",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "Authorization", "value": "Bearer {{access_token}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/webhooks",
                                "body": {"mode": "raw", "raw": '{"url":"https://hooks.ejemplo.com/contextforge","events":["document.published"],"secret":"whsec_tu_secreto"}'},
                            },
                        },
                        {
                            "name": "Export Portable Project Bundle",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                                "url": "{{baseUrl}}/api/v1/projects/{{project_slug}}/export",
                            },
                        },
                    ],
                },
                {
                    "name": "06. Context Bundles & MCP",
                    "item": [
                        {
                            "name": "Compile Context Bundle",
                            "request": {
                                "method": "POST",
                                "header": [
                                    {"key": "Content-Type", "value": "application/json"},
                                    {"key": "X-API-Key", "value": "{{api_key}}"},
                                ],
                                "url": "{{baseUrl}}/api/v1/bundles/compile",
                                "body": {"mode": "raw", "raw": '{"name":"Cursor Rules Pack","project_slug":"{{project_slug}}","max_tokens":16000,"export_format":"markdown"}'},
                            },
                        },
                        {
                            "name": "MCP Server Info",
                            "request": {"method": "GET", "url": "{{baseUrl}}/mcp/info"},
                        },
                        {
                            "name": "MCP SSE Stream (requires X-API-Key in enterprise_rbac)",
                            "request": {
                                "method": "GET",
                                "header": [{"key": "X-API-Key", "value": "{{api_key}}"}],
                                "url": "{{baseUrl}}/mcp/sse",
                            },
                        },
                    ],
                },
            ],
        }
