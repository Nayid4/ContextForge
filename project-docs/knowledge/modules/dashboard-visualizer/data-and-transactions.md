---
id: MOD-DASH-DATA
title: "Módulo: dashboard-visualizer — Datos & Transacciones"
module: "dashboard-visualizer"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["data", "state", "store", "persistence"]
---

# Módulo: dashboard-visualizer — Datos & Transacciones

---

## 1. Estado en Memoria y Persistencia Local
- **Store Reactivo**: El estado global reside en una instancia singleton de `Store` que almacena:
  - `features`: Array normalizado de historias y tareas.
  - `currentSpec`: Metadatos del spec en desarrollo.
  - `knowledgeIndex`: Índice documental, estantes y diagramas.
  - `ui`: Pestaña activa, modo oscuro/claro, filtros y paginación.
- **Persistencia en LocalStorage**: Si el navegador tiene disponible `localStorage`, se preservan preferencias de tema (`theme: 'dark' | 'light'`) y documentos editados localmente.

---

## 2. Bloqueos de Concurrencia y Sincronización
- **Flags Anti-Bucle en Scroll**: Variables booleanas `isScrollingFromEditor` e `isScrollingFromPreview` con temporizadores de 60ms para evitar que el evento `scroll` de una columna re-dispare recursivamente el de la otra.
- **Auto-Sync Controlador**: Si se detecta `protocol === 'file:'`, el polling por temporizador se apaga por completo, evitando carreras de datos y saturación de la CPU.
