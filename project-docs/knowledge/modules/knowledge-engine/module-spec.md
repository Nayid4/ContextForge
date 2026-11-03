---
id: MOD-KNOW-SPEC
title: "Módulo: knowledge-engine — Especificación & Tarjetas CRC"
module: "knowledge-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["knowledge-engine", "docs-as-code", "rag", "graphrag", "crc-cards"]
---

# Módulo: knowledge-engine — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la extracción, estandarización y mantenimiento de la Base de Conocimiento Soberana Docs-as-Code para alimentar agentes de IA y desarrolladores sin sesgo.

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Responsabilidad Primaria**: Elicitar la visión del producto, diagnosticar la arquitectura real AS-IS, mantener el catálogo de reglas `BR-*` y compilar el megadocumento `MASTER-PROJECT-KNOWLEDGE.md`.

---

## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `DocScanner` | `<<Scanner>>` | 1. Recorrer `project-docs/knowledge/` recursivamente.<br/>2. Extraer títulos, resúmenes y metadatos AST.<br/>3. Calcular tiempo de lectura y conteo de palabras. | `FileSystem`, `MarkdownParser` |
| `DiagramExtractor` | `<<Extractor>>` | 1. Parsear bloques ` ```mermaid ` en documentos clave.<br/>2. Enriquecer objetos de diagrama con código limpio. | `KnowledgeIndex` |
| `MasterCompiler` | `<<Compiler>>` | 1. Unificar todos los documentos 01-12 y módulos en `MASTER-PROJECT-KNOWLEDGE.md`.<br/>2. Generar tabla de contenidos ancla interactiva. | `DocScanner`, `FileSystem` |

---

## 3. Contratos de Salida
- `project-docs/knowledge/knowledge-index.json`
- `project-docs/data-fallback.js`
- `project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md`
