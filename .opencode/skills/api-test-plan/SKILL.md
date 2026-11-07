---
name: api-test-plan
description: Use when creating API REST test plans. Generates markdown test plan and .http files for REST Client based on project documentation.
---

# Skill: Plan de Pruebas API REST

## Descripción
Genera planes de pruebas completos para APIs REST, incluyendo documentación markdown y archivos `.http` para REST Client (VS Code). Soporta múltiples planes organizados por recurso.

> **Siguiente paso:** Después de generar el plan, ejecútalo con el skill `execute-api-test-plan`.

## Entrada Requerida
- **Documentación del proyecto** (obligatorio) - API endpoints, modelos de datos, requerimientos
- **Ruta de salida** (obligatorio) - Directorio donde guardar los planes

## Entrada Opcional
- **project-spec.yaml** - Especificación técnica del proyecto (`project-docs/project-spec.yaml` o raíz)
- **api-endpoints.md** - Documentación de endpoints

## Salida - Estructura de Directorios

```
tests-plan/
├── README.md                    # Índice de todos los planes
├── projects/
│   ├── test-plan.md            # Plan de pruebas de proyectos
│   ├── checklist.md            # Checklist de pruebas
│   └── projects.http           # Pruebas para REST Client
├── documents/
│   ├── test-plan.md
│   ├── checklist.md
│   └── documents.http
├── rules/
│   ├── test-plan.md
│   ├── checklist.md
│   └── rules.http
├── evidences/
│   ├── test-plan.md
│   ├── checklist.md
│   └── evidences.http
└── environment.http            # Variables de entorno globales
```

## Formato: test-plan.md

```markdown
# Plan de Pruebas - [Recurso]

## 1. Información General
- **Recurso:** [nombre del recurso]
- **Endpoints:** [cantidad]
- **Fecha:** [fecha]
- **Base URL:** http://localhost:3001

## 2. Endpoints

### 2.1 [GET] /api/[recurso]
**Descripción:** [descripción]

#### Pruebas de Éxito
| # | Descripción | Datos | Esperado |
|---|-------------|-------|----------|
| 1 | Listar todos | - | 200 + array |
| 2 | Filtrar por estado | ?status=active | 200 + array filtrado |

#### Pruebas de Error
| # | Descripción | Datos | Esperado |
|---|-------------|-------|----------|
| 1 | Parámetro inválido | ?status=invalid | 400 |

### 2.2 [POST] /api/[recurso]
...

## 3. Checklist
| # | Endpoint | Prueba | Estado |
|---|----------|--------|--------|
| 1 | GET /api/[recurso] | Listar todos | ⬜ |
```

## Formato: checklist.md

```markdown
# Checklist de Pruebas - [Recurso]

## Resumen
- Total de pruebas: [número]
- Completadas: 0
- Pendientes: [número]

## Pruebas

### Éxito
- [ ] [descripción de prueba]
- [ ] [descripción de prueba]

### Error
- [ ] [descripción de prueba]
- [ ] [descripción de prueba]

## Estado
| Estado | Cantidad |
|--------|----------|
| ⬜ Pendiente | [número] |
| ✅ Aprobado | 0 |
| ❌ Fallido | 0 |
```

## Formato: [recurso].http

> **IMPORTANTE:** NO usar bloques `> {% ... %}` para validaciones, generan error en la extensión REST Client.
> Cada prueba se separa con `###` y se documenta como comentario `###`.

```http
### [Listar todos los [recurso]]
GET {{baseUrl}}/api/[recurso]
Accept: {{contentType}}

### [Crear [recurso]]
POST {{baseUrl}}/api/[recurso]
Content-Type: {{contentType}}

{
  "name": "Test Item",
  ...
}
```

## Formato: environment.http

```http
@baseUrl = http://localhost:3001
@contentType = application/json

### Variables de Prueba - Proyectos
@projectId = 
@projectName = Test Project

### Variables de Prueba - Documentos
@documentId = 
@documentName = Test Document

### Variables de Prueba - Reglas
@ruleId = 
@ruleName = Test Rule

### Variables de Prueba - Evidencias
@evidenceId = 
```

## Generación de Pruebas por Endpoint

### Para cada recurso CRUD:

#### GET /api/[recurso]
- ✅ 200: Listar todos
- ✅ 200: Listar con filtros
- ✅ 200: Lista vacía
- ❌ 400: Parámetros inválidos

#### GET /api/[recurso]/:id
- ✅ 200: Obtener uno
- ❌ 404: No existe

#### POST /api/[recurso]
- ✅ 201: Crear exitosamente
- ❌ 400: Campos requeridos faltan
- ❌ 400: Datos inválidos

#### PUT /api/[recurso]/:id
- ✅ 200: Actualizar exitosamente
- ❌ 404: No existe
- ❌ 400: Datos inválidos
- ❌ 400: Recurso bloqueado (status done)

#### DELETE /api/[recurso]/:id
- ✅ 200: Eliminar exitosamente
- ❌ 404: No existe

## Generación Automática

### Paso 1: Crear estructura
```bash
mkdir -p tests-plan/{projects,documents,rules,evidences}
```

### Paso 2: Generar README.md
Índice con enlaces a cada plan

### Paso 3: Para cada recurso
1. Leer documentación de endpoints
2. Generar test-plan.md
3. Generar checklist.md
4. Generar [recurso].http
5. Crear environment.http

### Paso 4: Verificar
- Todos los textos en español
- Datos de prueba realistas
- Validaciones de respuesta
- Formato consistente

## Notas
- **Idioma:** Español para documentación
- **URLs:** Usar variables de environment.http
- **Datos:** Realistas pero genéricos
- **Validaciones:** Incluir status code y estructura
- **Organización:** Un directorio por recurso
