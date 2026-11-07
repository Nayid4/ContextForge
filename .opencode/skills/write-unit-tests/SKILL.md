---
name: write-unit-tests
description: Use when writing unit tests for a feature/spec to reach code coverage. Detects the project's language/framework and generates test files following its conventions, covering success and error paths. Language-agnostic. Suggested before verify-spec.
---

# Skill: Escritura de Tests Unitarios

## Descripción

Genera tests unitarios para el código implementado en un spec, cubriendo casos de éxito y error, siguiendo las convenciones del framework de testing detectado en el proyecto. Es **agnóstico al lenguaje**: usa `project-docs/project-spec.yaml` (o `project-spec.yaml`, `checks.test`, `runtime.language`) para elegir el framework correcto, o autodetecta si no existe.

> **Sugerencia:** Ejecutar después de implementar el spec (código de `generate-spec`) y antes de `verify-spec`, para asegurar que la tarea "tests unitarios" quede aprobada.

## Entrada Requerida

- **Directorio del spec** (obligatorio) - Para extraer "Componentes Afectados" y "Acceptance Criteria" de `spec.md` (en `project-docs/specs/`)
- **Módulo/directorio de código fuente** (obligatorio) - Donde se implementó la feature

## Entrada Opcional

- **project-spec.yaml** - Framework/comando de test configurado en `project-docs/project-spec.yaml` o raíz
- **Herramienta de cobertura deseada** - Si el proyecto no tiene una configurada

## Detección de Lenguaje/Framework

Prioridad de detección:

1. `runtime.language` + `checks.test.command` de `project-docs/project-spec.yaml` (o `project-spec.yaml`)
2. Archivos de configuración en el módulo:

| Lenguaje | Archivo indicador | Framework por defecto | Comando |
|----------|--------------------|------------------------|---------|
| Node.js | `package.json` | Jest | `npx jest --coverage` |
| Node.js (existente sin test runner) | `package.json` sin devDependency de test | Jest (agregar) | `npm test -- --coverage` |
| Python | `requirements.txt` / `pyproject.toml` | pytest | `pytest --cov` |
| Java | `pom.xml` / `build.gradle` | JUnit 5 | `mvn test` / `gradle test` |
| Go | `go.mod` | testing (stdlib) | `go test ./... -cover` |
| Ruby | `Gemfile` | RSpec | `bundle exec rspec` |
| .NET | `*.csproj` | xUnit | `dotnet test` |

Si el proyecto no tiene ningún framework de test instalado, **instalarlo** (agregar a devDependencies) usando el gestor de paquetes detectado (`runtime.packageManager` o autodetección), antes de escribir los tests.

## Flujo de Ejecución

### Paso 1: Analizar el Spec

1. Leer `spec.md` del spec → extraer:
   - `## Acceptance Criteria` (qué comportamientos deben cubrir los tests)
   - `### Componentes Afectados` (qué archivos de código probar)
2. Leer los archivos de código listados (controllers, services, models, utils, etc.)

### Paso 2: Determinar Estructura de Tests

Seguir la convención ya existente en el proyecto si hay tests previos (mismo directorio `test`/`tests`/`__tests__`, mismo sufijo `.test.js`/`.spec.js`/`_test.py`, etc.). Si no hay convención previa, usar el default del framework:

| Framework | Ubicación | Nomenclatura |
|-----------|-----------|--------------|
| Jest | `<módulo>/tests/` o junto al archivo | `<nombre>.test.js` |
| pytest | `<módulo>/tests/` | `test_<nombre>.py` |
| JUnit | `src/test/java/...` | `<Nombre>Test.java` |
| Go testing | junto al archivo | `<nombre>_test.go` |
| RSpec | `spec/` | `<nombre>_spec.rb` |
| xUnit | `<Módulo>.Tests/` | `<Nombre>Tests.cs` |

### Paso 3: Generar Tests por Componente

Para cada función/método público del componente, generar:

#### Casos de Éxito

- Entrada válida → salida/estado esperado
- Casos límite válidos (arrays vacíos, valores por defecto)

#### Casos de Error

- Entrada inválida → excepción o respuesta de error esperada
- Dependencias no encontradas (ej. recurso padre inexistente) → código/mensaje de error esperado
- Reglas de negocio del spec (ej. bloqueo por status `done`) → verificar que se respeten

#### Mocks/Stubs

- Mockear dependencias externas (base de datos, HTTP, filesystem) según convenciones del framework:
  - Jest: `jest.mock(...)`
  - pytest: `unittest.mock` / `pytest-mock`
  - JUnit: Mockito
  - Go: interfaces + fakes
  - RSpec: `double`/`instance_double`
  - xUnit: Moq

> Los tests unitarios NO deben requerir servicios reales corriendo (DB, red). Si el código depende de ellos, deben mockearse.

### Paso 4: Ejecutar y Medir Cobertura

1. Ejecutar el comando de test con cobertura (`--coverage`, `--cov`, etc.)
2. Verificar:
   - Exit code 0 (todos pasan)
   - Cobertura del/los archivo(s) del spec (idealmente > 80%, reportar el número real sin forzar un umbral arbitrario del proyecto)
3. Si algún test falla, corregir el test o el código (según corresponda) y re-ejecutar

### Paso 5: Actualizar Tracking del Spec y Enviar al Modelo Plane SQLite + Markdown

1. En `tasks.md` del spec: marcar `[x]` la tarea de tests unitarios (agregarla si no existía, ver sección "Retrocompatibilidad")
2. Enviar la evidencia de pruebas unitarias y cobertura al modelo relacional SQLite (`issue_evidences`, `issue_activities`, `ai_runs`) y sincronizar el espejo Markdown:
   ```bash
   node project-docs/cli.js issue evidence INT-<NNN> --type unit --title "Suite de Tests Unitarios y Cobertura" --file "project-docs/tests/unit/" --summary "Tests unitarios ejecutados con exito cubriendo rutas felices y de error" --skill write-unit-tests
   node project-docs/cli.js ai log --skill write-unit-tests --role implementer --issue INT-<NNN> --type UNIT_TESTING --summary "Generacion y ejecucion de tests unitarios con cobertura verificada"
   node project-docs/sync-data.js
   ```
3. Reportar al usuario: comando ejecutado, resultado, cobertura obtenida, archivos de test creados

## Retrocompatibilidad (specs sin tarea de tests unitarios)

Si el `tasks.md` del spec no tiene una tarea explícita de tests unitarios (specs generados antes de esta convención):

1. Agregar la tarea a "Fase 3: Testing": `- [ ] Escribir tests unitarios (cobertura de código)`
2. Marcarla `[x]` una vez completado este skill
3. Actualizar el contador "Total tareas" y "Completadas" en el resumen

## Notas

- **Agnóstico al lenguaje**: nunca asumir Jest/Node; siempre detectar primero
- **No modificar código de producción** salvo que un test revele un bug real (en ese caso, reportarlo como hallazgo, no corregirlo silenciosamente — igual que `execute-api-test-plan`)
- **Idioma:** Código de test en inglés (nombres, describe/it), comentarios/documentación de resumen en español
- **Cobertura real, no simulada**: siempre ejecutar el comando de test para confirmar que los tests generados realmente pasan

## Siguiente Paso

Una vez escritos y verificados los tests unitarios, ejecutar el skill `verify-spec` para validar el cierre completo del spec.
