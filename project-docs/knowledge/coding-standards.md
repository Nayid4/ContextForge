# Estándares de Codificación & Guardrails Anti-Sesgo

> [!IMPORTANT]
> Directrices obligatorias para desarrolladores y agentes de IA. Diseñadas para eliminar el sesgo algorítmico, prevenir alucinaciones de paquetes y mantener una arquitectura limpia.

---

## 1. Convenciones de Nomenclatura y Control de Versiones

- **Ramas Git**:
  - Exclusivamente dos tipos: `feature` y `bugfix`.
  - Estructura obligatoria: `{type}/INT-{numero}/{nombre_rama_de_lo_realizado}`.
  - Longitud máxima estricta: **80 caracteres**.
  - Ejemplo: `feature/INT-001/refactor_harness_architecture`.
- **Commits Semánticos**:
  - Formato: `feat(scope): descripción` o `fix(scope): descripción`.
  - Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
  - Idioma: Inglés para commits y código fuente; español para documentación técnica y comentarios explicativos.

---

## 2. Guardrails Anti-Alucinación (Inviolables para Agentes de IA)

1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `package.json` o `project-docs/project-spec.yaml`.
2. **Invariante de Conocimiento Previo**: Antes de implementar una solución, el agente debe verificar si ya existe una función, componente o regla en `project-docs/knowledge/`.
3. **Respeto a las Reglas de Negocio (BR-*)**: Ningún código puede modificar o relajar una regla de negocio sin una actualización previa y aprobada de la especificación.
4. **Cero Código Muerto**: Prohibido dejar código comentado, banderas de depuración (`console.log`, `debugger`) o secretos hardcodeados.

---

## 3. Arquitectura del Código Frontend (`project-docs/src/`)

- **Vanilla JS Modular**: Usar ES Modules puros (`import` / `export`) organizados por dominios en `src/features/`.
- **Separación de Responsabilidades**: Las funciones de renderizado devuelven cadenas HTML puras; los controladores de eventos se enlazan mediante selectores o `data-action`.
- **Inmutabilidad en el Store**: El estado global (`store.js`) se actualiza mediante acciones atómicas notificando a los suscriptores.
