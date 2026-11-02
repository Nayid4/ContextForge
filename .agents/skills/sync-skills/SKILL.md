---
name: sync-skills
description: Use when synchronizing skills from the .opencode/skills/ source of truth to the .github/skills/ (Copilot) and .agents/skills/ (Google Antigravity) mirrors. Checks each skill one by one, propagates changes, and reports differences without ever modifying the source.
---

# Skill: Sincronización de Skills (fuente → espejos)

## Descripción
Propaga las skills desde la **fuente de verdad** `.opencode/skills/` hasta los **espejos**:
- `.github/skills/` (usado por GitHub Copilot)
- `.agents/skills/` (usado por Google Antigravity)

Carpeta por carpeta, verificando que todas las copias queden idénticas.

> **Regla general (skills-sync):** toda skill nueva o modificada en `.opencode/skills/` debe reflejarse en `.github/skills/` y `.agents/skills/`. Esta skill ejecuta esa propagación de forma masiva y verificable.

## Entrada
- Ninguna entrada obligatoria — por defecto sincroniza todas las skills.
- Opcional: nombre de una skill específica a sincronizar.

## Fuente de Verdad
`.opencode/skills/<name>/SKILL.md` — frontmatter (`name` + `description`) y cuerpo completo de la skill. Este directorio **nunca** se modifica por esta skill.

## Destinos
1. `.github/skills/<name>/SKILL.md` — espejo para GitHub Copilot.
2. `.agents/skills/<name>/SKILL.md` — espejo para Google Antigravity.

## Proceso

### Paso 1: Listar skills fuente
Leer todos los subdirectorios de `.opencode/skills/`. Cada subdirectorio representa una skill y debe contener un `SKILL.md` cuyo campo `name` del frontmatter coincida con el nombre de la carpeta.

### Paso 2: Verificar una por una
Para cada skill en la fuente y para cada destino (`.github/skills/` y `.agents/skills/`):
1. Resolver la ruta destino.
2. **Si el destino NO existe:** crear el archivo (y carpeta) con el contenido exacto de la fuente.
3. **Si el destino existe:** comparar el contenido completo (frontmatter + cuerpo).
   - Si es idéntico: no hacer nada.
   - Si difiere: sobrescribir el destino con el contenido de la fuente.

### Paso 3: Detectar skills huérfanas
Si existe una skill en los directorios espejo que NO existe en la fuente, reportarla al usuario. **No eliminarla automáticamente.**

### Paso 4: Reporte final
Resumir al usuario:
- Skills creadas
- Skills actualizadas
- Skills ya sincronizadas (sin cambios)
- Skills huérfanas detectadas (si aplica)

## Reglas
- **Fuente intocable:** `.opencode/skills/` es siempre el origen; esta skill nunca escribe en él.
- **Destinos permitidos:** solo escribe en `.github/skills/` y `.agents/skills/`.
- **Sin borrados:** las skills de los espejos que no existen en la fuente se reportan, nunca se eliminan.
- **Verificación final:** confirmar con un diff que `.opencode/skills/`, `.github/skills/` y `.agents/skills/` quedaron sincronizados.
