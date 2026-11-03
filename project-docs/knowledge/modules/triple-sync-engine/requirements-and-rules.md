---
id: MOD-SYNC-RULES
title: "Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio"
module: "triple-sync-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["requirements", "rules", "triple-sync", "source-of-truth"]
---

# Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio

---

## 1. Requerimientos Funcionales Formales (IEEE 830)

### `RF-SYNC-001`: Replicación Unidireccional de Skills
- **Enunciado Formal**: Cuando se invoque la skill `sync-skills`, el sistema **debe** verificar cada una de las 18 skills en `.opencode/skills/` y propagar cualquier cambio a `.github/skills/` y `.agents/skills/` sin modificar jamás los archivos de origen.

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-SYNC-001` | Crítica | `.opencode/skills/` es la única fuente de verdad | `.opencode/rules/skills-sync.md` | Prohibido sync inverso |
| `BR-SYNC-002` | Alta | `frontmatter(opencode) === frontmatter(copilot) === frontmatter(agy)` | `sync-skills` | Falla paridad triple |
