# Módulo: triple-sync-engine (Motor de Sincronización Triple de Skills)

> [!NOTE]
> Bounded Context responsable de preservar la paridad estricta entre la fuente de verdad (`.opencode/skills/`) y sus espejos automáticos en Google Antigravity (`.agents/skills/`) y GitHub Copilot (`.github/skills/`).

## 1. Responsabilidades del Módulo
- Garantizar que las 18 skills de ingeniería posean idéntico contenido y frontmatter (`name` + `description`).
- Proveer la skill `/sync-skills` para auditoría y propagación unidireccional (de fuente a espejos).
- Prevenir drift o desincronización funcional entre plataformas de IA.

## 2. Contratos y Ubicaciones
- **Fuente de Verdad**: `.opencode/skills/{skill}/SKILL.md`
- **Espejo Copilot**: `.github/skills/{skill}/SKILL.md`
- **Espejo Antigravity**: `.agents/skills/{skill}/SKILL.md`

## 3. Catálogo de Skills Sincronizadas
- Auditoría & Conocimiento: `technical-audit`, `project-knowledge`, `requirements-analysis`.
- Especificación & Ciclo SDD: `generate-spec`, `spec`, `start-feature`, `sdd-workflow`.
- Técnicas de Implementación: `implement-tdd`, `implement-sdd`, `implement-ftd`, `implement`.
- Verificación & Calidad: `write-unit-tests`, `acceptance-testing`, `api-test-plan`, `execute-api-test-plan`, `generate-verify`, `verification`, `verify-spec`, `review`, `sync-skills`.
