---
id: "DOC-BUSINESS-RULES_MD"
title: "business rules"
collection: "engineering"
parent: null
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: true
is_favorite: false
full_width: false
last_updated: "2026-11-09"
tags: []
labels: ["product"]
---

# Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)

> [!IMPORTANT]
> Invariantes de cumplimiento estricto para desarrolladores y agentes de IA. Ninguna implementación, spec o refactorización puede violar estas reglas.

---

## Módulo: agent-orchestrator

### BR-ORCH-001: Formato y Longitud Estricta de Ramas Git
- **Severidad**: Crítica
- **Fórmula**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`
- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.
- **Descripción**: Toda rama de trabajo debe crearse desde la rama base, tener un prefijo `INT-` con número de ticket y no superar 80 caracteres.
- **Comportamiento ante Violación**: La rama es rechazada y el agente debe solicitar corrección al humano.

### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec
- **Severidad**: Crítica
- **Descripción**: Queda estrictamente prohibido pasar una tarea a `in_progress` o iniciar implementación sin aprobación explícita del humano mediante la herramienta `ask_question`.
- **Comportamiento ante Violación**: Detención inmediata del ciclo SDD.

### BR-ORCH-003: Subagente Revisor No Modifica Código
- **Severidad**: Crítica
- **Descripción**: El subagente `reviewer` evalúa de forma independiente e imparcial la trazabilidad, build y tests. Bajo ninguna circunstancia edita código de producción o pruebas.
- **Comportamiento ante Violación**: Se anula el veredicto y se reasigna al `implementer`.

---

## Módulo: triple-sync-engine

### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/
- **Severidad**: Crítica
- **Descripción**: La carpeta `.opencode/skills/` es la única fuente de verdad para las 18 skills del arnés. Los cambios se propagan de forma unidireccional a `.github/skills/` y `.agents/skills/`.
- **Comportamiento ante Violación**: Cualquier cambio aislado en espejos se sobrescribe al sincronizar.

### BR-SYNC-002: Paridad Estricta de Frontmatter
- **Severidad**: Alta
- **Descripción**: Todo archivo `SKILL.md` debe contener exactamente el mismo bloque YAML `name` y `description` en las tres plataformas.
- **Comportamiento ante Violación**: Reporte de inconsistencia en `/sync-skills`.

---

## Módulo: knowledge-engine

### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta
- **Severidad**: Crítica
- **Descripción**: Para garantizar que los diagramas se rendericen sin errores en cualquier parser web o visor markdown, todo ID de nodo debe ser estrictamente alfanumérico sin guiones (`nodeAuth`) y todo texto descriptivo debe estar entre comillas dobles (`["Texto seguro"]`).
- **Comportamiento ante Violación**: Diagrama marcado como inválido en tiempo de validación.

### BR-KNOW-002: Consulta Obligatoria Anti-Sesgo de la Base de Conocimiento
- **Severidad**: Crítica
- **Descripción**: Antes de proponer nuevas historias, redactar requerimientos o implementar código, los agentes DEBEN consultar `project-docs/knowledge/` para evitar reinventar capacidades o violar directrices.
- **Comportamiento ante Violación**: Prohibición estricta de alucinar librerías externas o duplicar endpoints.

---

## Módulo: dashboard-visualizer

### BR-DASH-001: Compatibilidad Offline Total (Protocolo file:///)
- **Severidad**: Crítica
- **Descripción**: El visor en `project-docs/index.html` debe ser 100% navegable con doble clic directo sin servidor local mediante la carga inmediata de `data-fallback.js`.
- **Comportamiento ante Violación**: El script `sync-data.js` actualiza automáticamente el fallback tras cada compilación.

### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo
- **Severidad**: Alta
- **Descripción**: La sincronización de scroll entre el editor Markdown y la vista previa utiliza flags de exclusión mutua para impedir bucles infinitos de eventos de scroll.
- **Comportamiento ante Violación**: Desactivación temporal del listener para restaurar fluidez.

---

## Módulo: testing-qa-suite

### BR-TEST-001: 100% de Tests en Verde para Cierre de Spec
- **Severidad**: Crítica
- **Descripción**: Ninguna feature o bugfix puede cerrarse como `done` si existe un solo test fallando en la suite de pruebas del proyecto.
- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y exige corrección.

### BR-TEST-002: Ejecutor de Pruebas Nativo sin Bloat
- **Severidad**: Alta
- **Descripción**: Las pruebas unitarias del arnés se ejecutan mediante `node --test` para asegurar tiempos de respuesta inferiores a 500ms y cero dependencias externas en testing.
- **Comportamiento ante Violación**: Se rechaza la inclusión de dependencias redundantes.

---

## Módulo: knowledge-engine & plane-wiki (Reglas BR-PAGE-*)

### BR-PAGE-01: Visibilidad Dual de Páginas
- **Severidad**: Media
- **Descripción**: Todo documento en la biblioteca de Plane Wiki clasifica su visibilidad en `access = 0` (Public, visible en toda la organización) o `access = 1` (Private, borrador personal).
- **Comportamiento ante Violación**: Por defecto toda página no explícita se indexa como pública (`access: 0`).

### BR-PAGE-02: Bloqueo Normativo e Inmutabilidad de Archivo (Lock Guard)
- **Severidad**: Crítica
- **Descripción**: Ninguna página con `is_locked = 1` o con `archived_at IS NOT NULL` permite editar su título o su contenido Markdown sin una operación previa y explícita de desbloqueo (`unlockPageInSQLite`) o restauración.
- **Comportamiento ante Violación**: SQLite rechaza la mutación lanzando una excepción `BR-PAGE-02 Violation`.

### BR-PAGE-03: Desmarcado Automático de Favoritos al Archivar
- **Severidad**: Media
- **Descripción**: Cuando una página es archivada (`archived_at` asignado), el sistema desmarca forzosamente `is_favorite = 0` para eliminarla de accesos directos.
- **Comportamiento ante Violación**: El motor de persistencia resetea `is_favorite = 0` automáticamente.

### BR-PAGE-04: Inmutabilidad de Visibilidad en Documentos Archivados
- **Severidad**: Alta
- **Descripción**: No está permitido alternar la visibilidad (`access`) de una página mientras se encuentre archivada.
- **Comportamiento ante Violación**: SQLite rechaza la actualización con `BR-PAGE-04 Violation: Cannot change access visibility of archived page`.

### BR-PAGE-07: Herencia de Colección en Páginas Hijas
- **Severidad**: Alta
- **Descripción**: Toda subpágina asignada a un `parent_id` hereda obligatoriamente el `collection_id` de su página padre. Al mover un padre a otra colección, la colección se propaga recursivamente a todos sus descendientes.
- **Comportamiento ante Violación**: La función `movePageInSQLite` sobrescribe el `collection_id` de los hijos para mantener coherencia espacial.

### BR-PAGE-08: Límite Jerárquico de Profundidad (Depth <= 4) y Prevención de Ciclos
- **Severidad**: Crítica
- **Descripción**: La jerarquía de anidación de páginas en una colección permite un máximo de 4 niveles de profundidad (`depth <= 4`, donde la raíz de la colección es nivel 0). Está estrictamente prohibido crear referencias circulares directas o indirectas (`A -> B -> A`).
- **Comportamiento ante Violación**: Si se intenta crear un ciclo, se lanza `Circular hierarchy detected: cannot set parent to self or descendant`. Si se excede el límite de 4 niveles, se lanza `Max page nesting depth exceeded (max 4 levels allowed)`.

### BR-PAGE-09: Archivo en Cascada de Jerarquías
- **Severidad**: Alta
- **Descripción**: Archivar una página padre propaga de inmediato el timestamp de archivo (`archived_at`) y el desmarcado de favoritos (`is_favorite = 0`) a todos sus hijos y descendientes en cascada.
- **Comportamiento ante Violación**: Ejecución automática de `archivePageCascadeInSQLite`.

### BR-PAGE-10: Slugs Únicos por Colección y Backfill de Depth
- **Severidad**: Alta
- **Descripción**: Cada página cuenta con un `slug` alfanumérico único dentro de su colección (`idx_pages_collection_slug`). Ante títulos duplicados en la misma colección, el algoritmo aplica sufijos correlativos (`-2`, `-3`).
- **Comportamiento ante Violación**: El cálculo determinista en `backfillSlugAndDepth` previene colisiones antes de escribir en disco o SQLite.


