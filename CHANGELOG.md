# Changelog — ContextForge

Todos los cambios relevantes de la plataforma **ContextForge (`v2.0.0`)** y del paquete reutilizable **`contextforge` (`v1.0.0`)** se documentan en este archivo. La arquitectura y estado actual (AS-IS) viven en [Context.md](Context.md).

---

## [2.1.0] — Modo Equipo, Endurecimiento SSRF/Egreso, Ciclo de Conocimiento y Remediación UX (Fases 0–4)

### Fase 0 — Auditoría UX/API
- Nueva auditoría exhaustiva [`docs/ux-audit-settings-integration.md`](docs/ux-audit-settings-integration.md) cubriendo `/settings` (`SET-01`..`SET-12`) y `/docs/integration-guide` (`INT-01`..`INT-09`), validando las 10 hipótesis de coherencia, seguridad y contratos.

### Fase 1 — Modo Equipo (`BR-23`)
- **Login y cambio obligatorio de contraseña:** Vistas `/login` y `/change-password`, endpoints `POST /api/v1/auth/logout`, `POST /api/v1/auth/change-password`, `GET /api/v1/auth/users` y cookie `HttpOnly`/`SameSite=Lax` (`cf_access_token`) respetando prioridad de `Authorization`/`X-API-Key`.
- **Bootstrap seguro del primer `Admin`:** Contraseña desde `CONTEXTFORGE_ADMIN_PASSWORD` o aleatoria de un solo uso con `must_change_password=True` (eliminada la credencial fija en runtime).
- **Rol `Owner` (`BR-23`) y gestión de miembros en UI:** Nuevo `UserRole.OWNER`, `PermissionAction.MANAGE_PROJECT_MEMBERS`, bloqueo al degradar o eliminar al último `Owner` del proyecto y modal de miembros en `/projects`.
- **Despliegue seguro por defecto:** `docker-compose.yml` arranca con `AUTH_MODE=enterprise_rbac` y enlace por defecto `127.0.0.1:8000`; `CONTEXTFORGE_STRICT_BIND_CHECK=true` por defecto y soporte `TRUSTED_PROXIES` para rate limiting detrás de reverse proxy.
- **Migración Alembic:** `migrations/versions/20261128_0002_f1_team_mode_owner_password.py`.

### Fase 2 — Seguridad, Egreso Explícito, Webhooks SSRF y Reindexación de Embeddings
- **Egreso explícito (`egress_class`):** Persistido en `llm_configurations.egress_class` (`local` | `cloud`) y aplicado en `SovereignRoutingPolicy`.
- **SSRF y cifrado en Webhooks:** `WebhookDispatcher` exige `https://`, resuelve DNS y valida rangos CIDR prohibidos (`0.0.0.0/8`, `100.64.0.0/10`, `fc00::/7`, `fe80::/10`, IPv4-mapped IPv6), usa `follow_redirects=False` y cifra secretos en `webhooks.secret_encrypted` con AES-256-GCM.
- **Portabilidad segura (`export`/`import`):** `export` excluye webhooks, llaves API y secretos LLM; `import` crea todos los documentos en `draft` y agentes en `private`.
- **Estado de reindexación de embeddings:** `GET /api/v1/settings/embeddings/status` y `POST /api/v1/settings/embeddings/reindex`.
- **Migración Alembic:** `migrations/versions/20261128_0003_f2_security_egress_webhooks.py`.

### Fase 3 — Ciclo de Conocimiento y Responsables (`BR-24`)
- **Responsables y frescura documental:** Campos `books.steward_user_id`, `review_interval_days` y `last_reviewed_at`, clasificación `fresh`/`due_soon`/`expired` y `PATCH /api/v1/projects/{slug}/documents/governance`.
- **Panel de Salud y Vacíos de Conocimiento (`/knowledge-health`):** Flujo completo de `knowledge_gaps` (`assign`, `ignore` con motivo obligatorio, acciones en lote `bulk`, `draft` y resolución automática al publicar documento); botón **"Documentar este vacío"** que precarga el editor (`/books/editor?from_gap=`) con módulo sugerido y sección `## Debe responder`.
- **Chat con trazabilidad de frescura:** Citas con fecha de última revisión, **"Reportar vacío"** y **"Preguntar al responsable"**.
- **Migración Alembic:** `migrations/versions/20261128_0004_f3_knowledge_cycle_stewards_gaps.py`.

### Fase 4 — Consistencia UX, Kit UI Unificado y Remediación Integral (21/21 hallazgos)
- **Kit UI unificado (`cf_ui_kit.js`) y WCAG 2.2 AA:** Renderizador único de errores `application/problem+json` con causa, acción sugerida y `request_id` copiable; chips semánticos unificados (editorial/sync/visibilidad/egreso), `:focus-visible` y `@media (prefers-reduced-motion: reduce)`.
- **Remediación completa de `/settings` (`SET-01`..`SET-12`):** Gestión completa de claves `cf_pub_*` (orígenes, agentes permitidos, cuota diaria, `last_used_at`), badges `egreso local`/`egreso cloud` con aviso en modo soberano y bloqueo en agentes `public`, configuración real de `settings` (embeddings/reindexación, `min_grounding_score`, `max_chunks`, retención), webhooks, export/import, verificación de cadena de auditoría y fix de DLQ (`dead_letter`).
- **Remediación completa de `/docs/integration-guide` (`INT-01`..`INT-09`) y Postman v2.1:** URL base dinámica desde `request.base_url`, snippets actualizados con `/v1/*` OpenAI, autenticación MCP con `X-API-Key`, sesión efímera del widget, y colección Postman v2.1 limpia (sin `Admin123!` ni archivos ficticios) cubriendo todas las capacidades AS-IS.

---

## [2.0.0-ya2] — Endurecimiento de Seguridad, Cero Drift y Live Widget Studio

### Seguridad (Bloque Ya-2 — `BR-22`)
- **Escape de delimitadores XML anti-prompt-injection (`GroundingPolicy`):** Escapa `<untrusted_document_context>` y `<context_chunk>` dentro del contenido de documentos y adjuntos para impedir escapes de contexto.
- **Guardia de citas en tiempo real durante streaming (`AgentChatExecutor.stream_execute`):** Bufferiza spans `[...]` durante el streaming token-a-token y valida cada cita con `GroundingPolicy.validate_citations()` antes de emitir tokens al cliente.
- **Soberanía y aislamiento de embeddings (`HttpDenseEmbeddingProvider` + `SovereignVectorStoreAdapter`):** Aplica `SovereignRoutingPolicy` (`BR-21`) y redacción DLP (`BR-13`) en proveedores cloud de embeddings, y persiste `embedding_model` + `embedding_dim` en `vector_store.sqlite3` para evitar mezclar espacios vectoriales incompatibles.
- **Protección SSRF y anti-replay en Webhooks (`WebhookDispatcher`):** Bloquea IPs privadas, loopback, link-local y hostnames internos (`localhost`, `127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `.internal`) e incluye `X-ContextForge-Timestamp` en la firma HMAC-SHA256 (`"{ts}." + raw_body`).
- **DLP en feedback y knowledge gaps:** Redacta PII/secretos antes de persistir `answer_feedback` y `knowledge_gaps`.
- **Importación portable endurecida (`POST /api/v1/projects/import`):** Valida límites de carga (`<= 500` docs, `<= 50` agentes, `<= 25 MB`), bloquea path traversal (`..`, `\`, rutas absolutas) y fuerza `visibility="private"` en todos los agentes importados.
- **Cuota diaria en evaluaciones (`POST .../evals/run`) y protección RBAC en `GET /metrics`:** Exige `PermissionAction.READ_AUDIT_LOGS` (`Admin`) en `enterprise_rbac` y aplica cuota diaria a corridas de evaluación.
- **Contrato de errores OpenAI en `/v1/*`:** Devuelve `{"error": {"message", "type", "param", "code"}}` en todas las rutas `/v1/*`, rechaza parámetros no soportados (`tools`, `n != 1`, `response_format`) con HTTP `400` y acota tamaño/cantidad de mensajes.
- **Advertencia de exposición de red en `AUTH_MODE=local`:** Alerta en arranque si `AUTH_MODE=local` se enlaza a `0.0.0.0` (con opción `CONTEXTFORGE_STRICT_BIND_CHECK=true`).

### Correcciones y UX
- **Fix `500 Internal Server Error` en `/agents` sin documentos:** Guarda defensiva para `active_llm=None` y migración automática de esquema en `data/database/contextforge.db`.
- **Fix Antigravity CLI (`agy`) con modelos explícitos:** Elimina `--effort` cuando se selecciona un modelo explícito (ej. `gemini-4-neon-medium`), permitiendo probar los 28 modelos con prompt real (`OK`).
- **Vista previa en vivo del Widget dentro de Agent Studio (`/agents`):** Selector de color + botón **Probar Widget aquí en vivo** en la pestaña *Desplegar*, con botones de feedback *Útil / No útil* integrados en el widget.

### Consistencia Documental Automatizada
- Nuevo script CI [`scripts/verify_context_drift.py`](scripts/verify_context_drift.py) integrado en `pytest` que contrasta `Context.md` contra `Base.metadata.tables` (25 tablas), rutas FastAPI en vivo y roles RBAC.

---

## [2.0.0-b4] — Operación, Feedback, Evals, Webhooks, Portabilidad y Prometheus (Bloque 4)
- **Feedback y Knowledge Gaps (`answer_feedback`, `knowledge_gaps`):** Votación `up`/`down` y captura automática de consultas abstenidas (`BR-08`) agrupadas por tópico con resolución desde API.
- **Plantillas de Agente y Suite de Evaluación Continua (`agent_eval_cases`):** Catálogo de 4 plantillas listas (`backend_architect`, `customer_support`, `security_auditor`, `engineering_onboarding`) y ejecución de regresión `POST .../evals/run`.
- **Webhooks Firmados (`webhooks`):** Despacho asíncrono HMAC-SHA256 en eventos `document.published` / `document.indexed`.
- **Exportar/Importar Proyecto Portable:** `GET /api/v1/projects/{slug}/export` y `POST /api/v1/projects/import`.
- **Métricas Prometheus:** Endpoint `GET /metrics` (`text/plain; version=0.0.4`).

---

## [2.0.0-b3] — Multi-Turno, Embeddings Densos, SQLite FTS5, Adjuntos RAG y Streaming Real (Bloque 3)
- **Memoria Multi-Turno (`QueryRewriterPolicy`):** Reescritura de consultas de seguimiento y bloque `<conversation_history>` preservando bloqueo de `role="system"` externo.
- **Embeddings Semánticos Densos (`IEmbeddingProviderPort`, `HttpDenseEmbeddingProvider`):** Soporte Ollama `/api/embed` y OpenAI `/v1/embeddings` con persistencia en `vector_store.sqlite3` y degradación automática a 4-gramas offline.
- **Índice Léxico Persistente SQLite FTS5 (`SqliteFts5LexicalIndex`):** Persistencia en `lexical_fts5.sqlite3` con `unicode61 remove_diacritics 2` y `bm25(chunks_fts)`.
- **Indexación RAG automática de adjuntos:** Fragmentación e indexación de `attachments.extracted_text` con citas `{doc_path}#{file_name}`.
- **Streaming Real Token-a-Token:** Implementado en `HttpMultiLlmAdapter.stream_generate()` para Ollama NDJSON, OpenAI-compatible SSE, Anthropic SSE y Gemini SSE.

---

## [2.0.0-b2] — Sincronización 3-Way, Editorial `published_version`, Telemetría y Alembic (Bloque 2)
- **Conflicto 3-Way (`BR-20`):** Columnas `books.last_synced_hash` y `books.sync_status` (`synced` / `in_conflict` / `deleted_on_disk`) + resolución explícita `POST /api/v1/documents/sync-resolve`.
- **Separación `published_version` vs `current_version` (`BR-04`):** `POST /api/v1/documents/draft-revision` edita borradores sin ocultar la versión publicada del índice RAG.
- **Telemetría Chat↔Agente y Auditoría:** `chat_sessions.agent_id`, `chat_sessions.agent_version`, `chat_messages.model_name`, `tokens_used`, `retrieved_chunk_ids_json`, `api_keys.last_used_at` y `document_comments.author_id` con borrado restringido a autor/`Admin`.
- **Alembic:** Scaffold configurado en `alembic.ini` + `migrations/`.

---

## [2.0.0-b1] — Seguridad por Egreso, Agentes Versionados y Gateway OpenAI (Bloque 1)
- **Soberanía por Destino de Egreso (`BR-21`):** Clasificación `local` vs `cloud` en `SovereignRoutingPolicy.classify_egress()`.
- **Allowlist Positiva CLI y Sandbox (`BR-17`):** `CliSecurityPolicy.ALLOWED_FLAGS_BY_BINARY` + ejecución en `TemporaryDirectory` sin secretos del host.
- **Visibilidad de Agentes, Widget Seguro y Cuotas (`BR-18`, `BR-19`):** `agents.visibility`, `daily_quota_requests`, `api_keys.allowed_agents_csv`, JWT efímero con claims `project`/`agent`/`scope="widget:chat"`, validación de citas `GroundingPolicy.validate_citations()` y redacción de internos para roles no privilegiados.
- **Membresía RBAC por Proyecto (`project_members`)** y **Triggers Append-Only** en SQLite y PostgreSQL (`BR-14`).

---

## [1.0.0] — Paquete Reutilizable `contextforge` y Plataforma Base
- Biblioteca Python independiente `src/contextforge/` (`0` dependencias externas obligatorias, `mypy --strict`, >= 95% cobertura).
- Plataforma Docs-as-Code con Editor Tri-Modal, Context Bundler, Servidor MCP (SSE + STDIO) y Consola Multi-LLM.
