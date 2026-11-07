# Diseño Técnico & Decisiones de Arquitectura (ADRs): INT-001

## Resumen
Refactorización del arnés de ingeniería SDD para desacoplar las dependencias hardcodeadas a `.NET`, erradicar datos mock de comercio electrónico en la base de conocimiento y el tablero, y dotar al propio arnés de una suite de pruebas automatizadas nativas.

---

## Decisiones de Arquitectura (ADRs)

### ADR-HARNESS-001: Arquitectura Multi-Stack Agnóstica para Subagentes
- **Contexto**: Anteriormente, `implementer.md` y `reviewer.md` ejecutaban directamente `dotnet build` y `dotnet test`, lo que provocaba fallos de sintaxis y rechazos al usarse en proyectos Node.js, Python o Go.
- **Decisión**: Los subagentes ahora inspeccionan dinámicamente `project-spec.yaml` (bloque `checks`) para obtener los comandos específicos de compilación y prueba.
- **Consecuencias**: El arnés es compatible con cualquier lenguaje manteniendo las mismas garantías de calidad y trazabilidad R↔Tests.

### ADR-HARNESS-002: Suite de Pruebas Nativas con Node.js Test Runner
- **Contexto**: El arnés requería pruebas automatizadas para sus motores de serialización y sincronización sin sobrecargar el repositorio con dependencias pesadas de testing (Jest, Mocha).
- **Decisión**: Utilizar el Node.js Test Runner nativo (`node --test tests/unit/**/*.test.js`) disponible desde Node.js v18+.
- **Consecuencias**: Ejecución instantánea con cero dependencias externas, ideal para entornos locales y pipelines CI/CD.

### ADR-HARNESS-003: Saneamiento del Backlog y Base de Conocimiento
- **Contexto**: `feature_list.json` y `project-spec.json` contenían información residual de "CloudSaaS Platform" con tareas de pasarelas de pago y carritos de compra que generaban sesgo en los agentes de IA.
- **Decisión**: Saneamiento total sustituyendo por las 8 tareas reales de arquitectura y módulos del arnés.
