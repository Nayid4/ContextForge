---
id: "DOC-MODULES_TESTING-QA-SUITE_SEQUENCE_MD"
title: "modules/testing qa suite/sequence"
collection: "engineering"
parent: "modules/testing-qa-suite/module-spec.md"
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-09"
tags: []
labels: ["engineering"]
---

# Flujo de Verificación Continua: testing-qa-suite

```mermaid
sequenceDiagram
  autonumber
  actor Runner as "Implementer / Reviewer"
  participant NPM as "npm test"
  participant RunnerNative as "Node.js Test Runner"
  participant UnitTests as "tests/unit/*.test.js"
  participant SmokeTests as "tests/e2e/*.test.js"

  Runner->>NPM: "Ejecutar npm test"
  NPM->>RunnerNative: "node --test tests/unit/**/*.test.js"
  RunnerNative->>UnitTests: "Ejecutar pruebas unitarias en paralelo"
  UnitTests-->>RunnerNative: "8/8 pruebas pasando en verde"
  Runner->>SmokeTests: "npm run test:e2e"
  SmokeTests-->>Runner: "2/2 pruebas smoke pasando en verde"
```


