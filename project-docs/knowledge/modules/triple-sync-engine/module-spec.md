---
id: "MOD-SYNC-SPEC"
title: "Módulo: triple-sync-engine — Especificación & Tarjetas CRC"
collection: "engineering"
parent: null
owner: "leader"
module: "triple-sync-engine"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["triple-sync","skills-sync","source-of-truth","crc-cards"]
labels: ["triple-sync","skills-sync","source-of-truth","crc-cards","engineering"]
---

# Módulo: triple-sync-engine — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la sincronización triple y paridad absoluta de las 18 skills entre OpenCode (`.opencode/`), GitHub Copilot (`.github/`) y Google Antigravity (`.agents/`).

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Responsabilidad Primaria**: Asegurar que `.opencode/skills/` se mantenga como la única fuente de verdad inmutable y que cualquier cambio se propague de forma idéntica a los espejos sin divergencia de frontmatter ni instrucciones.

---

## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `SkillsSyncEngine` | `<<SyncService>>` | 1. Leer skills en `.opencode/skills/`.<br/>2. Comparar con `.github/skills/` y `.agents/skills/`.<br/>3. Replicar contenido idéntico sin mutar el origen. | `FileSystem`, `SkillMirrorAuditor` |
| `FrontmatterValidator` | `<<Validator>>` | 1. Parsear bloque YAML `name` y `description`.<br/>2. Comprobar paridad carácter por carácter en los 3 espejos. | `YAMLParser` |

---

## 3. Contratos de Entrada y Salida
- **Fuente de Verdad**: `.opencode/skills/{skill}/SKILL.md`
- **Destinos Espejo**: `.github/skills/{skill}/SKILL.md` y `.agents/skills/{skill}/SKILL.md`


