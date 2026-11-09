---
id: "MOD-TEST-DIAG"
title: "Módulo: testing-qa-suite — Suite de 6 Diagramas"
collection: "engineering"
parent: "modules/testing-qa-suite/module-spec.md"
owner: "leader"
module: "testing-qa-suite"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-03"
tags: ["c3","class","sequence","state","activity","erd"]
labels: ["c3","class","sequence","state","activity","erd","engineering"]
---

# Módulo: testing-qa-suite — Suite de 6 Diagramas

---

## 1. Diagrama de Componentes C3 del Módulo

```mermaid
flowchart LR
  subgraph ModuleQA["testing-qa-suite"]
    compRunner["VerifyRunner (project-docs/verify.sh)"]
    compUnit["NodeTestRunner (Unit, White, Black, System)"]
    compPlaywright["PlaywrightRunner (Acceptance E2E)"]
    compLoad["LoadSimulator (Concurrencia)"]
  end

  compRunner --> compUnit
  compRunner --> compLoad
  compRunner --> compPlaywright
```

---

## 2. Diagrama de Clases UML del Módulo

```mermaid
classDiagram
  class VerifyRunner {
    +executeAllPhases() int
    +runUnitTests() TestResult
    +runPlaywright() TestResult
  }

  class TestResult {
    +int totalTests
    +int passed
    +int failed
    +float durationMs
    +bool isGreen()
  }

  VerifyRunner --> TestResult : "evalúa"
```

---

## 3. Diagrama de Secuencia de Verificación

```mermaid
sequenceDiagram
  autonumber
  actor Dev as "Desarrollador / Agente"
  participant Runner as "project-docs/verify.sh"
  participant Unit as "node --test"
  participant Playwright as "npx playwright"
  participant Sync as "sync-data.js"

  Dev->>Runner: "bash project-docs/verify.sh"
  Runner->>Unit: "Ejecutar unit, whitebox, blackbox, system, load"
  Unit-->>Runner: "Todos los tests en verde"
  Runner->>Playwright: "Ejecutar 7 escenarios E2E"
  Playwright-->>Runner: "7 passed"
  Runner->>Sync: "Recompilar y sincronizar"
  Sync-->>Runner: "Sincronización completada"
  Runner-->>Dev: "VERIFICACION EXITOSA (Verde)"
```

---

## 4. Diagrama de Máquina de Estados de la Suite

```mermaid
stateDiagram-v2
  [*] --> Compiling : "esbuild"
  Compiling --> UnitTesting : "node --test unit"
  UnitTesting --> Whitebox : "node --test whitebox"
  Whitebox --> Blackbox : "node --test blackbox"
  Blackbox --> SystemIntegration : "node --test system"
  SystemIntegration --> LoadTesting : "node --test load"
  LoadTesting --> PlaywrightE2E : "npx playwright test"
  PlaywrightE2E --> Success : "Todos en verde"
  PlaywrightE2E --> Failed : "Cualquier fallo"
  Success --> [*]
  Failed --> [*]
```

---

## 5. Diagrama de Actividades de Control de Calidad

```mermaid
flowchart TD
  actStart(["Inicio project-docs/verify.sh"])
  actBuild["esbuild bundle"]
  actTests["node --test suites"]
  checkPass{"Pasa 100%?"}
  actPlaywright["Playwright E2E"]
  actSync["sync-data.js"]
  actGreen(["Aprobado (Código 0)"])
  actRed(["Abortado (Código 1)"])

  actStart --> actBuild
  actBuild --> actTests
  actTests --> checkPass
  checkPass -->|No| actRed
  checkPass -->|Sí| actPlaywright
  actPlaywright --> actSync
  actSync --> actGreen
```

---

## 6. Sub-Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
  TEST_RUN ||--|{ TEST_SUITE : "ejecuta"
  TEST_SUITE ||--|{ TEST_CASE : "evalúa"

  TEST_RUN {
    string id PK
    string timestamp
    string status
  }

  TEST_SUITE {
    string name PK
    string category
  }

  TEST_CASE {
    string name PK
    int duration_ms
    bool passed
  }
```


