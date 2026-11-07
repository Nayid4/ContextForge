# Requerimientos Técnicos — INT-019: Paridad 1:1 de Reglas de Negocio, Flujos Interactivos y UI/UX de Plane Library

| Campo | Valor |
|---|---|
| **ID** | `INT-019` |
| **Rama** | `feature/INT-019/plane_library_flows_and_ux_refinement` |
| **Módulo** | `Knowledge Engine` (`project-docs/src/modules/Pages/`) |
| **Técnica de Implementación** | `SDD` + `TDD` |
| **Estado** | `done` |

## 1. Historia de Usuario (Scrum)

- **Como** Arquitecto de Software, Desarrollador y Agente de IA,
- **Quiero** que la sección `Library` replique 1:1 las reglas de negocio, los flujos interactivos, la organización de datos y la UI/UX de Plane Library (`apps/web/core/store/pages/*` y `apps/web/core/components/pages/*`),
- **Para** gestionar toda la base de conocimiento del proyecto con la misma precisión, gobierno documental y fluidez que en Plane.

## 2. Reglas de Negocio Plane Library (`BR-PAGE-01`..`BR-PAGE-06`)

1. **`BR-PAGE-01` (`getPageName` Untitled Fallback)**: Cuando una página se crea o guarda con título vacío o solo espacios, su nombre se normaliza automáticamente a `"Untitled"`.
2. **`BR-PAGE-02` (`isContentEditable` Lock & Archive Guard)**: El contenido de una página solo es editable cuando `!is_locked && !archived_at`, mostrando un banner interactivo de estado (`#article-status-banner`) en el lector/editor cuando está bloqueada o archivada.
3. **`BR-PAGE-03` (`archivePage` Auto-Unfavorite Rule)**: Archivar una página establece `archived_at` y desmarca automáticamente `is_favorite = 0`.
4. **`BR-PAGE-04` (`toggleAccess` Archive Guard)**: La visibilidad (`access`: `0` Public / `1` Private) solo puede modificarse cuando `!archived_at`.
5. **`BR-PAGE-05` (`duplicatePage` / Make a Copy)**: Duplicar una página clona su registro en SQLite y crea una copia física `.md` con sufijo `(Copy)`.
6. **`BR-PAGE-06` (`shouldFilterPage` Filtering & Sorting Engine)**: Filtrado por pestañas `Public`, `Private` y `Archived`, ordenamiento por `updated_at`, `created_at` y `name` en `asc`/`desc`, popover de filtros (`Favorites`, `Locked`, `Created by`) y barra de chips `PageAppliedFiltersList`.
