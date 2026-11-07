---
name: execute-api-test-plan
description: Use when executing API REST test plans. Runs curl commands based on .http files, updates checklists, and documents findings. Never resolves issues. Suggested after api-test-plan.
---

# Skill: Ejecución de Plan de Pruebas API REST

## Descripción
Ejecuta planes de pruebas API REST usando curl, actualiza el checklist de progreso y documenta hallazgos encontrados. **Solo ejecuta un plan a la vez.**

> **Sugerencia:** Este skill se ejecuta después de `api-test-plan`. Primero genera el plan, luego ejecútalo con este skill.

## Entrada Requerida
- **Directorio del plan** (obligatorio) - Ruta al directorio del recurso a probar
- **Servidor activo** (obligatorio) - Backend corriendo en el puerto configurado

## Entrada Opcional
- **Variables personalizadas** - Overrides para environment.http

## Restricciones

> **CRÍTICO:** Ejecutar UN SOLO plan por vez. Nunca ejecutar múltiples planes simultáneamente.

## Flujo de Ejecución

### Paso 1: Preparación
1. Verificar que el servidor esté activo (`curl /health`)
2. Leer `environment.http` para obtener variables
3. Leer `[recurso].http` para obtener las pruebas
4. Leer `test-plan.md` para entender las validaciones esperadas
5. Leer `checklist.md` actual

### Paso 2: Ejecutar Pruebas
Para cada prueba definida en el `.http`:

1. **Parsear el request** del archivo `.http`
   - Método HTTP
   - URL (reemplazar variables `{{baseUrl}}`, `{{contentType}}`)
   - Headers
   - Body (si aplica)

2. **Ejecutar curl** con los parámetros parseados

3. **Validar respuesta** contra lo documentado en `test-plan.md`
   - Status code esperado
   - Estructura del body
   - Valores específicos

4. **Registrar resultado**
   - ✅ Aprobado: respuesta coincide con lo esperado
   - ❌ Fallido: respuesta no coincide

### Paso 3: Actualizar Checklist
Después de cada prueba, actualizar `checklist.md`:
- Cambiar `[ ]` por `[x]` si pasó
- Cambiar `⬜` por `❌` si falló
- Actualizar contadores en la sección de Resumen

### Paso 4: Documentar Hallazgos
Si hay pruebas fallidas, crear/actualizar `hallazgos.md` en el mismo directorio:

```markdown
# Hallazgos - [Recurso]

## Resumen
- Total de hallazgos: [número]
- Fecha de ejecución: [fecha]

## Hallazgos

### [H-001] [Título del hallazgo]
- **Prueba:** [nombre de la prueba]
- **Endpoint:** [METHOD /ruta]
- **Status esperado:** [código]
- **Status obtenido:** [código]
- **Descripción:** [qué falló]
- **Response body:** [respuesta completa]
- **Severidad:** [crítico/alto/medio/bajo]
- **Estado:** Abierto

---
```

### Paso 5: Reporte Final y Envío al Modelo Plane SQLite + Markdown
Al terminar todas las pruebas, generar resumen:
- Total de pruebas ejecutadas
- Aprobadas vs Fallidas
- Lista de hallazgos encontrados
- Estado final del checklist
- Enviar los resultados del checklist y hallazgos hacia `issue_evidences` y `ai_runs` en SQLite (`harness.db`):
  ```bash
  node project-docs/cli.js issue evidence INT-<NNN> --type api-report --title "Ejecucion de Plan API REST ([recurso])" --file "tests-plan/[recurso]/checklist.md" --skill execute-api-test-plan
  node project-docs/cli.js ai log --skill execute-api-test-plan --role reviewer --issue INT-<NNN> --type API_TEST_EXECUTION --summary "Ejecucion de pruebas API REST con curl y registro de checklist" --artifacts "tests-plan/[recurso]/checklist.md"
  node project-docs/sync-data.js
  ```

## Formato de Ejecución curl

### GET Request
```bash
curl -s -w "\n%{http_code}" -X GET "http://localhost:3001/api/projects" \
  -H "Accept: application/json"
```

### POST Request
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3001/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","priority":"alta","deadline":"2026-12-31"}'
```

### PUT Request
```bash
curl -s -w "\n%{http_code}" -X PUT "http://localhost:3001/api/projects/ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated"}'
```

### DELETE Request
```bash
curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3001/api/projects/ID" \
  -H "Accept: application/json"
```

## Parseo de Archivos .http

Cada prueba en el archivo `.http` sigue este formato:

```http
### [Descripción de la prueba]
METHODO {{baseUrl}}/ruta
Header: valor

{ body }
### Validación esperada
### - Status: [código]
### - Campo: valor
```

### Reglas de Parseo
1. `###` indica inicio de nueva prueba
2. Línea vacía separa headers del body
3. Líneas `###` después del body son validaciones
4. Variables `{{variable}}` se reemplazan por valores de `environment.http`

## Formato de Hallazgos

### Severidad
- **Crítico:** API no funciona, error 500, datos corruptos
- **Alto:** Funcionalidad principal falla
- **Medio:** Funcionalidad secundaria falla
- **Bajo:** Comportamiento inesperado pero funcional

### Campos Obligatorios
- Título descriptivo
- Prueba que generó el hallazgo
- Status esperado vs obtenido
- Response body completo
- Severidad clasificada
- Estado = Abierto

## Checklist - Formato de Actualización

### Antes de ejecutar
```markdown
## Pruebas

### Éxito
- [ ] Listar todos
- [ ] Crear válido
```

### Después de ejecutar
```markdown
## Pruebas

### Éxito
- [x] Listar todos
- [ ] Crear válido
```

### Resumen actualizado
```markdown
## Resumen
- Total de pruebas: 14
- Completadas: 1
- Pendientes: 13

## Estado
| Estado | Cantidad |
|--------|----------|
| ⬜ Pendiente | 13 |
| ✅ Aprobado | 1 |
| ❌ Fallido | 0 |
```

## Notas
- **Idioma:** Español para documentación
- **Un plan a la vez:** Nunca ejecutar múltiples planes
- **No resolver:** Solo documentar hallazgos, nunca intentar arreglar
- **Curl silencioso:** Usar `-s` para output limpio
- **Capturar status:** Usar `-w "\n%{http_code}"` para obtener código de estado
- **Variables:** Siempre leer de `environment.http` primero
- **Orden:** Respetar el orden de pruebas del `.http`
- **Dependencias:** Si una prueba crea un recurso, usar su ID en siguientes pruebas

## Archivos Generados
- `checklist.md` - Actualizado con resultados
- `hallazgos.md` - Documentación de issues encontrados (solo si hay fallas)
