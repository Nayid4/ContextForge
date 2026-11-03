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
