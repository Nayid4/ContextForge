---
name: sync-skills
description: Use when synchronizing skills from the .opencode/skills/ source of truth to the .github/skills/ Copilot mirror. Checks each skill one by one, propagates changes, and reports differences without ever modifying the source.
---

# Skill: Sincronización de Skills (fuente → espejo)

## Descripción
Propaga las skills desde la **fuente de verdad** `.opencode/skills/` hasta el **espejo** `.github/skills/` (usado por GitHub Copilot), carpeta por carpeta, verificando que ambas copias queden idénticas.

> **Regla general (skills-sync):** toda skill nueva o modificada en `.opencode/skills/` debe reflejarse en `.github/skills/`. Esta skill ejecuta esa propagación de forma masiva y verificable.

## Entrada
- Ninguna entrada obligatoria — por defecto sincroniza todas las skills.
- Opcional: nombre de una skill específica a sincronizar.

## Fuente de Verdad
`.opencode/skills/<name>/SKILL.md` — frontmatter (`name` + `description`) y cuerpo completo de la skill. Este directorio **nunca** se modifica por esta skill.

## Destino
`.github/skills/<name>/SKILL.md` — espejo para GitHub Copilot. Único directorio escribible por esta skill.

## Proceso

### Paso 1: Listar skills fuente
Leer todos los subdirectorios de `.opencode/skills/`. Cada subdirectorio representa una skill y debe contener un `SKILL.md` cuyo campo `name` del frontmatter coincida con el nombre de la carpeta.

### Paso 2: Verificar una por una
Para cada skill en la fuente:
1. Resolver la ruta destino: `.github/skills/<name>/SKILL.md`.
2. **Si el destino NO existe:** crear el archivo (y carpeta) con el contenido exacto de la fuente.
3. **Si el destino existe:** comparar el contenido completo (frontmatter + cuerpo).
   - Si es idéntico: no hacer nada.
   - Si difiere: sobrescribir el destino con el contenido de la fuente.

### Paso 3: Detectar skills huérfanas
Si existe una skill en `.github/skills/` que NO existe en la fuente, reportarla al usuario. **No eliminarla automáticamente.**

### Paso 4: Reporte final
Resumir al usuario:
- Skills creadas
- Skills actualizadas
- Skills ya sincronizadas (sin cambios)
- Skills huérfanas detectadas (si aplica)

## Reglas
- **Fuente intocable:** `.opencode/skills/` es siempre el origen; esta skill nunca escribe en él.
- **Único destino:** solo escribe en `.github/skills/`.
- **Sin borrados:** las skills del espejo que no existen en la fuente se reportan, nunca se eliminan.
- **Verificación final:** confirmar con un diff que `.opencode/skills/` y `.github/skills/` quedaron idénticos.

## Ejemplo de Uso

```
- Fuente: .opencode/skills/api-test-plan/SKILL.md
- Destino: .github/skills/api-test-plan/SKILL.md
- Resultado: creado/actualizado. La fuente no se toca.
```

## Notas
- Ejecutar esta skill después de agregar o editar manualmente cualquier archivo en `.opencode/skills/`.
- Si la modificación se hizo directamente en `.github/skills/` (espejo), reportarlo: la fuente de verdad es `.opencode/skills/` y el cambio debe rehacerse allí primero.
