---
id: "MOD-ORCH-DATA"
title: "Módulo: agent-orchestrator — Datos & Transacciones"
collection: "engineering"
parent: "modules/agent-orchestrator/module-spec.md"
owner: "leader"
module: "agent-orchestrator"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-03"
tags: ["data","transactions","git-refs","concurrency"]
labels: ["data","transactions","git-refs","concurrency","engineering"]
---

# Módulo: agent-orchestrator — Datos & Transacciones

---

## 1. Entidades Persistidas y Referencias Git

El orquestador interactúa con dos fuentes de persistencia:
1. **Referencias Git Locales (`.git/refs/heads/`)**:
   - Punteros SHA-1 a los commits de trabajo en las ramas `{feature|bugfix}/INT-{id}/{name}`.
2. **Archivos de Progreso JSON**:
   - `progress/current.json`: Estado de la feature en curso, id, nombre, tareas completadas vs pendientes.
   - `progress/history.json`: Bitácora histórica inmutable de specs completados y cerrados.

---

## 2. Fronteras Transaccionales y Concurrencia
- **Atomicidad en Creación de Ramas**: La invocación `git checkout -b {branch}` es atómica en el sistema de archivos local de Git. Si la rama ya existe o el nombre es inválido, Git aborta sin mutar el HEAD actual.
- **Concurrencia Multi-Agente**: Los subagentes se ejecutan con `Workspace: "inherit"`, lo que asegura que todos compartan el mismo working directory en la rama activa sin crear ramas fantasma o duplicadas.


