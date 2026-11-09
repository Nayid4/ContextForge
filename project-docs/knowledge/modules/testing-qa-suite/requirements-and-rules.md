---
id: "MOD-TEST-RULES"
title: "Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio"
collection: "engineering"
parent: "modules/testing-qa-suite/module-spec.md"
owner: "leader"
module: "testing-qa-suite"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["requirements","rules","acceptance","verification"]
labels: ["requirements","rules","acceptance","verification","engineering"]
---

# Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio

---

## 1. Requerimientos Funcionales Formales (IEEE 830)

### `RF-TEST-001`: Pipeline de Verificación en 8 Niveles (`project-docs/verify.sh`)
- **Enunciado Formal**: Cuando se ejecute la verificación del proyecto, el sistema **debe** compilar el bundle con esbuild, correr pruebas unitarias, smoke ATDD, caja blanca, caja negra BVA, pruebas de sistema, prueba de carga concurrente y pruebas Playwright E2E, deteniendo la ejecución si algún nivel falla.

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-TEST-001` | Crítica | `exitCode == 0` en todas las fases de `project-docs/verify.sh` | `project-docs/verify.sh` | Aborta commit o merge |
| `BR-TEST-002` | Alta | Concurrencia de carga $p95 < 200\text{ms}$ con 0% de fallos | `tests/load/server-concurrency.test.js` | Falla suite de carga |


