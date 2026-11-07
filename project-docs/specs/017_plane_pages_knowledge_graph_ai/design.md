# Diseño Arquitectónico y Decisiones (ADRs) — INT-017

## ADR-017-1: Extensión del Esquema SQLite a 28 Tablas (`page_logs` y `page_labels`)
- **Contexto:** En Plane (`apps/api/plane/db/models/page.py`), cada `Page` registra sus vínculos transaccionales hacia entidades (`PageLog`) y sus etiquetas (`PageLabel`), además de propiedades de vista (`view_props`, `is_locked`).
- **Decisión:** Añadir las tablas `page_logs` y `page_labels` en `project-docs/src/core/db.js`, completando 28 tablas relacionales, y construir el extractor determinista `extractPageTelemetryAndLogs(content, relPath)` en `project-docs/src/core/sqlite-sync.js`.

## ADR-017-2: Panel de Inspección Derecho de 4 Pestañas (`PageNavigationPane.js`) y Smart Entity Chips
- **Contexto:** Plane organiza la inspección de una página en un panel lateral derecho con 4 pestañas (`Outline`, `Info`, `Assets`, `Version History`) y barras flotantes cuando se contrae.
- **Decisión:** Implementar `PageNavigationPane.js` con las 4 pestañas, integrar `renderPageHeaderActions` con el asistente contextual `Ask Harness AI`, y enriquecer `PageReader.js` mediante `enrichMarkdownWithSmartChips(html, issues)` para transformar `INT-XXX` en chips interactivos que abren `IssueDetailModal` sin alterar bloques `<pre>` ni diagramas Mermaid.
