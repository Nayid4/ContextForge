# Inventario de Capacidades del Sistema (System Capabilities)

> [!NOTE]
> Inventario exhaustivo de capacidades para acelerar el onboarding técnico y prevenir la duplicación o re-implementación innecesaria de funcionalidades existentes.

---

## Matriz de Capacidades Instaladas

| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `CAP-ORCH-001` | `agent-orchestrator` | Control estricto de ramas `{type}/INT-{id}/{name}` $\le 80$c | Git hooks / Rules | Operativo ✅ |
| `CAP-ORCH-002` | `agent-orchestrator` | Puerta de aprobación humana del spec | `ask_question` | Operativo ✅ |
| `CAP-ORCH-003` | `agent-orchestrator` | Auditoría imparcial de calidad sin editar código | Subagente `reviewer` | Operativo ✅ |
| `CAP-SYNC-001` | `triple-sync-engine` | Auditoría de paridad de skills en 3 plataformas | Skill `/sync-skills` | Operativo ✅ |
| `CAP-SYNC-002` | `triple-sync-engine` | Replicación automática de skills a espejos | `sync-skills.sh` / Script | Operativo ✅ |
| `CAP-KNOW-001` | `knowledge-engine` | Descubrimiento en 2 fases anti-context overflow | Skill `/project-knowledge` | Operativo ✅ |
| `CAP-KNOW-002` | `knowledge-engine` | Modelado C4 & UML en Mermaid estricto | Plantillas canónicas | Operativo ✅ |
| `CAP-KNOW-003` | `knowledge-engine` | Mantenimiento Docs-as-Code incremental | `project-docs/knowledge/` | Operativo ✅ |
| `CAP-DASH-001` | `dashboard-visualizer` | Biblioteca por estantes con tarjeta Hero | `KnowledgeBase.js` | Operativo ✅ |
| `CAP-DASH-002` | `dashboard-visualizer` | Lector editorial centrado 780px con TOC flotante | `MarkdownViewer.js` | Operativo ✅ |
| `CAP-DASH-003` | `dashboard-visualizer` | Editor Dual ContextForge con scroll sincronizado | `KnowledgeBase.js` | Operativo ✅ |
| `CAP-DASH-004` | `dashboard-visualizer` | Constelación 3D piramidal de 4 niveles | `SpaceView3D.js` | Operativo ✅ |
| `CAP-DASH-005` | `dashboard-visualizer` | Búsqueda Global Omnibox modal (`Ctrl+K`) | `main.js` | Operativo ✅ |
| `CAP-DASH-006` | `dashboard-visualizer` | Compatibilidad 100% offline (file:///) | `data-fallback.js` | Operativo ✅ |
| `CAP-TEST-001` | `testing-qa-suite` | Pruebas unitarias nativas ultrarrápidas (<200ms) | `npm test` | Operativo ✅ |
| `CAP-TEST-002` | `testing-qa-suite` | Pruebas smoke de evaluación web | `npm run test:e2e` | Operativo ✅ |
| `CAP-TEST-003` | `testing-qa-suite` | Verificación de paridad y sincronización | `npm run sync` | Operativo ✅ |
