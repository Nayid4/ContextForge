---
id: DOC-BIZ-OVERVIEW
title: "Visión del Producto, Contexto de Negocio y Stakeholders"
module: "global"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["ieee-830", "business-context", "product-vision", "stakeholders", "raci"]
---

# Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)

> [!NOTE]
> Especificación formal del propósito, alcance, límites, usuarios y gobernanza del **AI Agentic SDD Engineering Harness** bajo el estándar IEEE Std. 830-1998 / ISO/IEC/IEEE 29148.

---

## 1. Naturaleza y Propósito del Proyecto

El **AI Agentic SDD Engineering Harness** es un arnés universal y agnóstico de ingeniería de software dirigido por especificaciones (**Spec-Driven Development — SDD**) diseñado para permitir la colaboración autónoma, segura y determinista entre ingenieros humanos y agentes de inteligencia artificial (Google Antigravity, GitHub Copilot y OpenCode).

### 1.1 Formulación del Problema

#### Dolor de Negocio
- **Fricción Cognitiva y Pérdida de Productividad**: En organizaciones de software, la rotación de desarrolladores y el conocimiento tácito atrapado en silos (*Bus Factor = 1*) provocan que los ingenieros senior pierdan entre 1.5 y 2.5 horas diarias respondiendo dudas operativas y validando reglas de negocio no documentadas.
- **Alucinaciones y Regresiones por IA**: Los asistentes de programación tradicionales generan código sintácticamente correcto pero funcionalmente incompatible cuando carecen de un modelo formal del dominio, rompiendo invariantes de base de datos, violando reglas de negocio (`BR-*`) o importando librerías no autorizadas.

#### Dolor Técnico
- **Ceguera de Contexto en Proyectos Extensos**: A partir de 50.000 líneas de código, cargar archivos planos en prompts satura la atención del modelo y causa omisiones catastróficas.
- **Falta de Trazabilidad RTM**: Ausencia de vinculación bidireccional entre requerimientos funcionales (`RF-*`), reglas de negocio (`BR-*`), historias de usuario (`HU-*`), código fuente y suites de prueba automatizadas.

---

## 2. Declaración Formal de la Visión del Producto

> **PARA** ingenieros de software, arquitectos de soluciones y equipos de desarrollo asistidos por IA,  
> **QUIENES** experimentan alucinaciones, código desalineado con el dominio y regresiones al usar agentes de programación en bases de código medianas y complejas,  
> **EL** AI Agentic SDD Engineering Harness,  
> **QUE ES UN** arnés de ingeniería de software agnóstico basado en Docs-as-Code, orquestación multi-agente y verificación formal en 8 niveles,  
> **QUE** garantiza una precisión funcional $\ge 95\%$ en el código generado por IA mediante un ciclo cerrado y determinista (Especificación EARS $\to$ Puerta Humana $\to$ Implementación TDD/SDD $\to$ Revisión Imparcial $\to$ Verificación Automatizada), triple sincronización de skills y tablero visual offline.

---

## 3. Ámbito del Producto (IEEE 830 Secciones 1.2 y 2.2)

### 3.1 Qué HACE el Sistema (Alcance Incluido)
1. **Orquestación Multi-Agente Homologada**: Provee 4 roles especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con responsabilidades estrictamente delimitadas.
2. **Gobernanza de Ramas y Commits**: Impone la convención obligatoria `{feature|bugfix}/INT-{numero}/{nombre_rama}` con longitud máxima de 80 caracteres y commits semánticos (`feat`, `fix`).
3. **Puertas de Decisión Humana Infranqueables**: Utiliza herramientas nativas (`ask_question`) para congelar la ejecución hasta obtener aprobación explícita del humano antes de implementar o integrar código.
4. **Triple Sincronización de 18 Skills**: Mantiene paridad absoluta e instantánea entre la fuente de verdad (`.opencode/skills/`) y los espejos (`.github/skills/` y `.agents/skills/`).
5. **Base de Conocimiento Soberana (Docs-as-Code)**: Elicita y estructura modelos C4, diagramas UML, diccionario de datos/ERD, catálogo de reglas de negocio (`BR-*`), ADRs y radiografía granular de módulos.
6. **Tablero Visual Offline-First (`project-docs/`)**: Aplicación web en Vanilla JS y Tailwind v4 con arquitectura screaming, lector editorial, editor dual Markdown/Bloques ContextForge, grafos de dependencias y constelación 3D en Three.js con soporte nativo para protocolo `file:///`.
7. **Pipeline de Calidad en 8 Niveles (`project-docs/verify.sh`)**: Ejecuta pruebas unitarias, ATDD smoke, caja blanca, caja negra (BVA/resiliencia), integración/sistema, carga concurrente y aceptación E2E con Playwright.

### 3.2 Qué NO HACE el Sistema (Exclusiones Explícitas)
- **No Toma Decisiones de Arquitectura Autónomas**: Las decisiones de diseño, aprobación de especificaciones e integración a la rama base requieren siempre autorización del humano.
- **No Realiza Push Remoto no Autorizado**: Queda terminantemente prohibido ejecutar `git push` a repositorios remotos sin confirmación explícita del usuario.
- **No Modifica Código Durante la Fase de Revisión**: El subagente `reviewer` audita de forma imparcial y jamás edita código fuente ni tests.
- **No Acopla el Proyecto a un Framework Específico**: El arnés es agnóstico al lenguaje (Node.js, .NET, Python, Go, Java, Rust); solo la carpeta de configuración `.agents/` y `project-docs/` forman el arnés.

---

## 4. Catálogo de Stakeholders y Matriz RACI (IEEE 830 Sección 2.3)

### 4.1 Catálogo de Interesados

| Stakeholder | Rol en el Sistema | Responsabilidad | Intereses Principales | Necesidades Clave |
|---|---|---|---|---|
| **Tech Lead / Arquitecto** | Sponsor & Owner | Diseñar la arquitectura base y aprobar specs/ADRs | Mantenibilidad, reducción de deuda técnica | Documentación AS-IS fidedigna, cero alucinaciones de IA |
| **Ingeniero de Software (Dev)** | Usuario Directo | Implementar features y refactorizaciones | Velocidad de desarrollo, contexto claro | Búsqueda rápida de reglas BR-*, especificaciones unívocas |
| **Agentes de IA (AGY/Copilot)** | Ejecutores Asistidos | Redactar specs, implementar código y auditar | Contexto sin truncamiento, instrucciones deterministas | YAML frontmatter, tarjetas CRC, lista blanca de dependencias |
| **QA Automation Specialist** | Usuario Directo | Diseñar y supervisar la suite de pruebas | Cobertura en ramas, confiabilidad de regresión | Matriz RTM completa, pruebas BVA y Playwright E2E |
| **Product Manager / Negocio** | Usuario Indirecto | Priorizar features y validar aceptación | Time-to-market, alineación con negocio | Visibilidad visual de progreso en el tablero interactivo |

### 4.2 Matriz RACI de Componentes del Sistema

| Componente / Proceso | Tech Lead | Dev Humano | Leader Agent | Implementer | Reviewer | QA |
|---|---|---|---|---|---|---|
| **Definición de Requerimientos** | A | C | R | I | C | C |
| **Aprobación de Spec (Puerta)** | A / R | A / R | C | I | I | I |
| **Implementación de Código** | I | C | C | R | I | I |
| **Auditoría de Calidad / Review** | I | I | C | I | R | C |
| **Ejecución de project-docs/verify.sh** | I | C | I | R | R | A / R |
| **Integración a Rama Base** | A | R | C | I | I | I |

*Convención: R = Responsable de ejecutar, A = Aprobador final, C = Consultado, I = Informado.*

---

## 5. Perfiles de Usuario y Personas (IEEE 830 Sección 2.3)

### Persona 1: Ingeniero Senior / Tech Lead
- **Formación**: Licenciatura / Maestría en Ciencias de la Computación o Ingeniería de Sistemas.
- **Experiencia**: >8 años en desarrollo de software y arquitectura distribuida.
- **Punto de Dolor**: Dedica demasiado tiempo explicando arquitectura histórica y corrigiendo PRs generados por IA que inventan dependencias o violan reglas de negocio.
- **Objetivo con el Arnés**: Disponer de un arnés que obligue a los agentes a ceñirse al contexto soberano antes de escribir una sola línea de código.

### Persona 2: Desarrollador Junior / Nuevo Integrante
- **Formación**: Grado en Ingeniería o egresado de Bootcamp técnico.
- **Experiencia**: 6 meses a 2 años en programación.
- **Punto de Dolor**: Alta fricción cognitiva al incorporarse a proyectos grandes; miedo a romper reglas tácitas no documentadas.
- **Objetivo con el Arnés**: Reducir su *time-to-first-PR* a menos de una semana gracias a la documentación interactiva y las tarjetas CRC.
