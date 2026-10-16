# project-docs

> Plantilla de documentación del proyecto. Reemplaza este índice con la documentación real de tu proyecto (stack, arquitectura, modelos de datos, API, infraestructura, decisiones).

## Estructura

- `feature_list.json` — Features del proyecto con status (`pending`, `in_progress`, `done`, `blocked`). Generado/mantenido con la skill `requirements-analysis`.
- `index.html` — Dashboard visual de features. Se abre en el navegador junto a `feature_list.json` y muestra stats, specs en proceso, historial y filtros. El nombre del proyecto lo toma de `feature_list.json` (`project`).
- `progres/current.json` — Spec activo (`{}` = sin spec en proceso). Gestionado por `generate-spec` / `verify-spec`.
- `progres/history.json` — Historial de specs cerrados (`records[]`). Gestionado por `verify-spec`.
- `<module>/specs/<NNN>-<feature>/` — Specs técnicos por feature (`spec.md`, `tasks.md`, `decisions.md`), creados por `generate-spec`.
- `<module>/tests-plan/` — Planes de pruebas API (markdown + `.http`), creados por `api-test-plan`.

## Documentación recomendada (ejemplos)

| Documento | Propósito |
|-----------|-----------|
| `architecture.md` | Arquitectura y componentes |
| `tech-stack.md` | Stack tecnológico |
| `api-endpoints.md` | Endpoints REST |
| `data-models.md` | Modelos de datos |
| `decisions.md` | Decisiones técnicas (ADRs) |
