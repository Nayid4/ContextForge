---
id: "MOD-KNOW-SPEC"
title: "Módulo: knowledge-engine — Especificación & Tarjetas CRC"
collection: "engineering"
parent: null
owner: "leader"
module: "knowledge-engine"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-03"
tags: ["knowledge-engine","docs-as-code","rag","graphrag","crc-cards"]
labels: ["knowledge-engine","docs-as-code","rag","graphrag","crc-cards","engineering"]
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

---

## 4. Endpoints y Métodos HTTP del Módulo (`knowledge-engine`)

| Método | Endpoint | Descripción | Parámetros / Payload |
|---|---|---|---|
| `GET` | `/api/plane/pages` | Listado general de páginas indexadas | Query: `?state=all&access=public&shelf=...` |
| `GET` | `/api/plane/pages/:id` | Contenido Markdown completo, snapshots de versiones, bitácora y etiquetas | Path: `id` (slug o identificador) |
| `POST` | `/api/plane/pages` | Crear o realizar upsert de página en SQLite y disco | Body: `{ title, shelf, access, file_path, content_markdown }` |
| `PATCH` / `PUT` | `/api/plane/pages/:id` | Actualizar propiedades (`title`, `access`, `is_favorite`, `full_width`) | Body: `{ title, access, is_favorite, full_width, content_markdown }` |
| `POST` | `/api/plane/pages/:id/unlock` | Desbloquear documento normativo (con auditoría en `page_logs`) | Body: `{ actorRole, reason }` |
| `POST` | `/api/plane/pages/:id/lock` | Bloquear documento normativo (con auditoría en `page_logs`) | Body: `{ actorRole, reason }` |
| `POST` | `/api/plane/pages/:id/move` | Mover página de colección o padre jerárquico (`BR-PAGE-07`, `BR-PAGE-08`) | Body: `{ collection_id, parent_id }` |
| `POST` | `/api/plane/pages/:id/archive-cascade` | Archivar página y todos sus descendientes (`BR-PAGE-09`) | Ninguno |
| `POST` | `/api/plane/pages/:id/versions/:ver/restore` | Restaurar snapshot histórico de versión | Path: `id`, `ver` (número de versión) |
| `POST` | `/api/plane/collections` | Crear nueva colección en Plane Wiki | Body: `{ name, description, icon, color, is_private }` |
| `PATCH` | `/api/plane/collections/:id` | Actualizar metadatos de colección | Body: `{ name, description, icon, color, is_private }` |
| `DELETE` | `/api/plane/collections/:id` | Archivar colección en SQLite | Path: `id` |
| `POST` | `/api/plane/sync` | Forzar re-sincronización bidireccional disco Markdown ↔ SQLite | Ninguno |


