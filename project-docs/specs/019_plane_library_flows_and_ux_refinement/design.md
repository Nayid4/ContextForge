# Diseño Técnico y Decisiones Arquitectónicas — INT-019

## ADR-019-01: Homologación de `base-page.ts` y `project-page.store.ts` de Plane en SQLite y Vanilla JS
- **Contexto**: Plane organiza su módulo `Library (Pages)` separando páginas en `Public` (`access = 0`), `Private` (`access = 1`) y `Archived` (`archived_at != null`), aplicando invariantes de negocio en `base-page.ts` (líneas 407-446).
- **Decisión**: Implementar las invariantes `BR-PAGE-01`..`BR-PAGE-06` tanto en la capa de persistencia (`sqlite-sync.js`, `serve.js`, `cli.js`) como en la capa de dominio Frontend (`page.service.js`, `page.store.js`, `KnowledgeBase.js`, `main.js`).

## ADR-019-02: Organización Automática desde la Skill `/project-knowledge`
- **Contexto**: La skill `/project-knowledge` genera los documentos canónicos IEEE 830, C4, UML 2.5, DDD, CRC y `MASTER-PROJECT-KNOWLEDGE.md`.
- **Decisión**: Actualizar `.opencode/skills/project-knowledge/SKILL.md` (y sus espejos en `.github/skills/` y `.agents/skills/`) para clasificar cada documento en su estante Plane (`shelf`), visibilidad (`--access public|private`), bloqueo normativo (`--locked`), favorito (`--favorite`), ancho completo (`--full-width`), etiquetas (`page_labels`) y grafo relacional (`page_logs`).
