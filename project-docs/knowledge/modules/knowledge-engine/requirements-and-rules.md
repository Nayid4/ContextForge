---
id: MOD-KNOW-RULES
title: "Módulo: knowledge-engine — Requerimientos & Reglas de Negocio"
module: "knowledge-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["requirements", "rules", "anti-bias", "mermaid-syntax"]
---

# Módulo: knowledge-engine — Requerimientos & Reglas de Negocio

---

## 1. Requerimientos Funcionales Formales (IEEE 830)

### `RF-KNOW-001`: Ingesta Universal y Muestreo Quirúrgico
- **Enunciado Formal**: Cuando el motor escanee archivos con más de 800 líneas de código, **no debe** cargarlos completos en memoria, sino que **debe** aplicar extracción de firmas por regex y lectura focalizada por rangos de líneas.

### `RF-KNOW-002`: Doble Salida Modular y Megadocumento Maestro
- **Enunciado Formal**: Tras auditar el repositorio, el sistema **debe** generar los documentos modulares en `project-docs/knowledge/` y compilar adicionalmente el archivo maestro consolidado `MASTER-PROJECT-KNOWLEDGE.md` con el 100% de la información sin truncar.

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-KNOW-001` | Crítica | IDs Mermaid alfanuméricos puros + textos entrecomillados | `project-docs/sync-data.js` | Diagrama roto en parser |
| `BR-KNOW-002` | Crítica | Consulta obligatoria de `project-docs/knowledge/` antes de codificar | `.agents/rules/antigravity-harness.md` | Rechazo en Review |
| `BR-KNOW-003` | Alta | YAML frontmatter obligatorio en todo `.md` | `project-docs/knowledge/` | Falla indexación RAG |
