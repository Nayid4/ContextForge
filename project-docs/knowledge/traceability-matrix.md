# Matriz de Trazabilidad Cruzada (RTM)

> [!NOTE]
> Matriz de Trazabilidad de Requerimientos (RTM) que conecta requerimientos funcionales, reglas de negocio, historias de usuario, componentes de código y pruebas automatizadas.

---

## Matriz Bidireccional de Cobertura

| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |
| :--- | :--- | :--- | :--- | :--- |
| `RF-ORCH-001` | `BR-ORCH-001` | `US-001` | `.agents/rules/antigravity-harness.md` | `tests/unit/branching-rules.test.js` |
| `RF-ORCH-002` | `BR-ORCH-002` | `US-001` | `.agents/agents/leader.md` | `tests/unit/branching-rules.test.js` |
| `RF-ORCH-003` | `BR-ORCH-002` | `US-001` | `.agents/rules/antigravity-harness.md` | Proceso interactivo (`ask_question`) |
| `RF-ORCH-004` | `BR-ORCH-003` | `US-001` | `.agents/agents/reviewer.md` | Auditoría en `review_*.md` |
| `RF-SYNC-001` | `BR-SYNC-001` | `US-002` | `.opencode/skills/sync-skills/` | `/sync-skills` audit report |
| `RF-SYNC-002` | `BR-SYNC-002` | `US-002` | `.agents/skills/sync-skills/` | `SKILL.md` frontmatter check |
| `RF-KNOW-001` | `BR-KNOW-002` | `US-003` | `.agents/skills/project-knowledge/` | `project-docs/knowledge/` scan |
| `RF-KNOW-002` | `BR-KNOW-001` | `US-003` | `project-docs/knowledge/c4-model.md` | Mermaid Parser Validation |
| `RF-DASH-001` | `BR-DASH-001` | `US-003` | `src/features/knowledge-base/` | `tests/unit/sync-data.test.js` |
| `RF-DASH-002` | `BR-DASH-001` | `US-003` | `src/shared/MarkdownViewer.js` | `tests/unit/markdown-parser.test.js` |
| `RF-DASH-003` | `BR-DASH-002` | `US-003` | `src/features/knowledge-base/` | `tests/unit/markdown-parser.test.js` |
| `RF-DASH-004` | `BR-DASH-001` | `US-004` | `src/main.js` (Omnibox Modal) | `tests/e2e/dashboard-smoke.test.js` |
| `RF-DASH-005` | `BR-DASH-001` | `US-003` | `src/features/space-view-3d/` | `tests/e2e/dashboard-smoke.test.js` |
| `RF-TEST-001` | `BR-TEST-002` | `US-005` | `package.json` (`npm test`) | `tests/unit/*.test.js` |
| `RF-TEST-002` | `BR-TEST-001` | `US-005` | `tests/e2e/dashboard-smoke.test.js` | `npm run test:e2e` |
