# Catálogo de Decisiones de Arquitectura (ADR Catalog)

> [!NOTE]
> Registro canónico de Decisiones de Arquitectura (ADR) según el formato Michael Nygard. Documenta el qué, el por qué y las consecuencias técnicas asumidas para evitar refactorizaciones regresivas por parte de agentes de IA.

---

## ADR-001: Desacoplamiento Universal de Subagentes (Multi-Stack Agnostic)
- **Fecha**: 2026-11-02
- **Estado**: Aceptado
- **Contexto**: Anteriormente los subagentes `implementer` y `reviewer` ejecutaban comandos fijos de `.NET` (`dotnet build /warnaserror`), fallando en repositorios políglotas o basados en Node.js, Python o Go.
- **Decisión**: Los subagentes inspeccionan dinámicamente el bloque `checks` de `project-docs/project-spec.yaml` para obtener los comandos específicos de compilación y pruebas del proyecto objetivo.
- **Consecuencias**: El arnés opera de manera transparente sobre cualquier stack tecnológico preservando la misma disciplina SDD.

---

## ADR-002: Sincronización Triple de Skills con Fuente de Verdad Única
- **Fecha**: 2026-11-01
- **Estado**: Aceptado
- **Contexto**: El desarrollo asistido por IA ocurre a menudo en múltiples plataformas (Google Antigravity, OpenCode, GitHub Copilot). Mantener skills dispersas producía drift funcional.
- **Decisión**: Establecer `.opencode/skills/` como la única fuente canónica y generar espejos automáticos en `.github/skills/` y `.agents/skills/` mediante la skill `/sync-skills`.
- **Consecuencias**: Paridad total de capacidades en las tres herramientas sin duplicación manual.

---

## ADR-003: Pruebas Automatizadas Nativas con Node.js Test Runner
- **Fecha**: 2026-11-02
- **Estado**: Aceptado
- **Contexto**: El arnés requería pruebas automatizadas para sus serializadores y sincronizadores, pero añadir frameworks pesados como Jest o Mocha introducía sobrecarga de instalación y dependencias vulnerables.
- **Decisión**: Utilizar el ejecutor nativo `node --test` integrado en Node.js v18+.
- **Consecuencias**: Tiempos de ejecución inferiores a 200ms con cero dependencias externas en tiempo de ejecución.

---

## ADR-004: Arquitectura Screaming & Tailwind CSS v4 en el Tablero Visual
- **Fecha**: 2026-11-01
- **Estado**: Aceptado
- **Contexto**: La interfaz de seguimiento en `project-docs/` necesitaba ser modular, mantenible y liviana sin depender de frameworks de compilación SPA como React o Angular.
- **Decisión**: Organizar el código bajo Screaming Architecture (`src/features/` por dominio) utilizando Vanilla JS moderno (ES Modules) y Tailwind CSS v4 en el navegador (`@tailwindcss/browser@4`).
- **Consecuencias**: Modularidad limpia, código ligero y soporte nativo para temas claro/oscuro.

---

## ADR-005: Editor Dual ContextForge con Scroll Sincronizado Proporcional
- **Fecha**: 2026-11-02
- **Estado**: Aceptado
- **Contexto**: Los desarrolladores y arquitectos requerían tanto la velocidad del editor de texto Markdown como la comodidad estructurada de bloques visuales para manipular requerimientos y diagramas.
- **Decisión**: Implementar un conmutador de modo dual (`Modo Markdown` / `Modo Bloques`) con serialización bidireccional instantánea y sincronización de scroll proporcional basada en el ratio de desplazamiento con flags de exclusión mutua.
- **Consecuencias**: Edición fluida sin pérdida de formato ni bloqueos por loops de eventos.

---

## ADR-006: Constelación 3D en Jerarquía Piramidal Three.js
- **Fecha**: 2026-11-02
- **Estado**: Aceptado
- **Contexto**: La representación en grafo 3D anterior colocaba los nodos en un único plano caótico, provocando colisión de etiquetas e imposibilidad de comprender la jerarquía del sistema.
- **Decisión**: Distribuir los nodos en 4 niveles arquitectónicos verticales ($Y=+165$ Ápice, $Y=+55$ Core, $Y=-55$ Features, $Y=-165$ Base) con distribución radial armónica y curvas cuadráticas de Bezier.
- **Consecuencias**: Comprensión visual inmediata de la criticidad y dependencias del sistema.

---

## ADR-007: Compatibilidad Offline Total (Zero-Server Fallback)
- **Fecha**: 2026-11-01
- **Estado**: Aceptado
- **Contexto**: En entornos restringidos o sin conexión a internet, los navegadores bloquean peticiones `fetch()` locales bajo el protocolo `file:///` por políticas de CORS.
- **Decisión**: Generar automáticamente `project-docs/data-fallback.js` antes de cada compilación para embeber los datos en `window.__FALLBACK_DATA__`.
- **Consecuencias**: El tablero funciona al 100% abriendo directamente `index.html` con doble clic.
