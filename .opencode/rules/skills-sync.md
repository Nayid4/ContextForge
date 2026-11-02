# Regla de Sincronización de Skills

## Regla

**SIEMPRE** que se cree o actualice una skill, el cambio debe reflejarse en las ubicaciones homologadas:

1. `.opencode/skills/<name>/SKILL.md` — **fuente de verdad** (usado por opencode)
2. `.github/skills/<name>/SKILL.md` — espejo (usado por GitHub Copilot)
3. `.agents/skills/<name>/SKILL.md` — espejo (usado por Google Antigravity)

Todas las copias deben mantener el **mismo contenido y frontmatter** (`name` + `description`).

## Flujo

### Al crear una skill nueva
1. Escribir el contenido en `.opencode/skills/<name>/SKILL.md` (fuente de verdad)
2. Copiar el mismo contenido a `.github/skills/<name>/SKILL.md` y `.agents/skills/<name>/SKILL.md`

### Al actualizar una skill existente
1. Modificar primero `.opencode/skills/<name>/SKILL.md`
2. Propagar el mismo cambio a `.github/skills/<name>/SKILL.md` y `.agents/skills/<name>/SKILL.md`
3. Verificar que las copias queden idénticas

## Verificación
Antes de dar por terminado un cambio de skill, confirmar que:
- El `name` del frontmatter coincide con el nombre de carpeta en las ubicaciones
- El `description` es idéntico en todas las copias
- El cuerpo del documento es idéntico en todas las copias

## Ejecución asistida

Para propagar de forma masiva y verificar diferencias, usar la skill `sync-skills`.
