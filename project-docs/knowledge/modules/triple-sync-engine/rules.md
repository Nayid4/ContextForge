# Reglas de Negocio Invariantes: triple-sync-engine

### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/
- **Severidad**: Crítica
- **Restricción**: Toda skill nueva o modificación de una existente debe crearse o editarse en `.opencode/skills/`. Jamás editar un espejo directamente para luego retro-propagar.
- **Comportamiento ante Violación**: Los cambios en espejos se sobrescriben automáticamente al ejecutar `/sync-skills`.

### BR-SYNC-002: Paridad Estricta de Frontmatter
- **Severidad**: Alta
- **Restricción**: El bloque YAML inicial (`name` y `description`) debe ser estrictamente idéntico en las tres carpetas.
- **Comportamiento ante Violación**: La skill es marcada como inconsistente en el reporte de sincronización.
