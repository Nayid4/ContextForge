---
description: "Use when creating or updating a skill in this repository. Requires the skill to be synced across .opencode/skills/ and .github/skills/."
---

# Regla de Sincronización de Skills

## Regla

**SIEMPRE** que se cree o actualice una skill, el cambio debe reflejarse en **las dos** ubicaciones:

1. `.opencode/skills/<name>/SKILL.md` — **fuente de verdad** (formato carpeta, usado por opencode)
2. `.github/skills/<name>/SKILL.md` — espejo (formato carpeta, usado por GitHub Copilot)

Ambas copias deben mantener el **mismo contenido y frontmatter** (`name` + `description`).

## Flujo

### Al crear una skill nueva
1. Escribir el contenido en `.opencode/skills/<name>/SKILL.md` (fuente de verdad)
2. Copiar el mismo contenido a `.github/skills/<name>/SKILL.md`

### Al actualizar una skill existente
1. Modificar primero `.opencode/skills/<name>/SKILL.md`
2. Propagar el mismo cambio a `.github/skills/<name>/SKILL.md`
3. Verificar que ambas copias queden idénticas

## Verificación
Antes de dar por terminado un cambio de skill, confirmar que:
- El `name` del frontmatter coincide con el nombre de carpeta en ambas ubicaciones
- El `description` es idéntico en ambas copias
- El cuerpo del documento es idéntico en ambas copias

## Ejecución asistida

Para propagar de forma masiva y verificar diferencias, usar la skill `sync-skills`.
