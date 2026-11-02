---
name: requirements-analysis
description: Use when analyzing project documentation to identify and document features/user stories. Generates feature_list.json with all requirements. Suggested after technical-audit.
---

# Skill: Análisis de Requerimientos

## Descripción
Analiza documentación del proyecto para identificar features, historias de usuario o casos de uso, y genera un archivo `feature_list.json` con el estado general del proyecto.

> **Sugerencia:** Ejecutar después de `technical-audit` para tener el contexto técnico completo.

## Entrada Requerida
- **Documentación del proyecto** (obligatorio) - Cualquier documentación que contenga requerimientos

## Entrada Opcional
- **project-spec.yaml** - Especificación técnica del proyecto
- **feature_list.json existente** - Para fusionar con nuevos requerimientos

## Salida
Archivos `feature_list.json` en la raíz del proyecto o directorio especificado.

## Estructura del JSON

```json
{
  "project": "Nombre del Proyecto",
  "description": "Descripción del proyecto",
  "rules": {
    "one_feature_at_a_time": true,
    "require_tests_to_close": true,
    "valid_status": [
      "pending",
      "in_progress",
      "done",
      "blocked"
    ]
  },
  "features": [
    {
      "id": 1,
      "name": "feature-name",
      "title": "Título de la Feature",
      "type": "feature | user-story | use-case",
      "description": "Descripción detallada",
      "module": "módulo o área del sistema",
      "priority": "alta | media | baja",
      "status": "pending",
      "acceptance": [
        "Criterio de aceptación 1",
        "Criterio de aceptación 2"
      ],
      "documentation": [
        "path/to/doc1.md",
        "path/to/doc2.md"
      ],
      "dependencies": [],
      "estimatedComplexity": "low | medium | high",
      "openedAt": null,
      "closedAt": null,
      "version": 1
    }
  ]
}
```

## Proceso de Análisis

### Paso 1: Verificar Si Ya Existe feature_list.json
1. Buscar `feature_list.json` en la raíz del proyecto
2. Si **NO existe**: Crear uno nuevo desde cero
3. Si **SÍ existe**: Cargar y comparar con nuevos requerimientos

### Paso 2: Recopilar Documentación
1. Buscar archivos markdown en `project-docs/`
2. Buscar README, CHANGELOG, etc.
3. Identificar archivos con requerimientos

### Paso 3: Identificar Requerimientos
Para cada documento, extraer:
- **Features** - Funcionalidades del sistema
- **Historias de Usuario** - "Como [rol], quiero [funcionalidad], para [beneficio]"
- **Casos de Uso** - Interacciones del sistema con actores
- **Endpoints** - Cada endpoint es una feature potencial
- **Modelos de Datos** - Entidades del sistema

### Paso 4: Comparar con Existente (si aplica)
Si `feature_list.json` ya existe:

1. **Leer features existentes**
2. **Comparar cada nuevo requerimiento** con los existentes
3. **Para cada coincidencia:**
   - Mostrar al usuario: "La feature [name] ya existe con status [status]"
   - Preguntar: "¿Desea modificarla? (s/n)"
   - Si sí: Permitir actualizar campos específicos
   - Si no: Mantener la existente sin cambios
4. **Para features nuevas:**
   - Agregar al final con nuevo ID secuencial
   - Mantener todas las features existentes intactas

> **IMPORTANTE:** Nunca eliminar features existentes. Solo agregar nuevas o actualizar las que el usuario confirme.

### Paso 5: Agrupar por Módulo
Organizar features por:
- **Backend** - API, modelos, lógica de negocio
- **Frontend** - UI/UX, componentes, páginas
- **Infraestructura** - Docker, despliegue, CI/CD
- **Documentación** - Docs, guías, manuales

### Paso 6: Asignar Metadatos
Para cada feature:
- `id` - Numérico secuencial (mantener IDs existentes)
- `name` - Nombre kebab-case
- `title` - Título descriptivo
- `type` - feature, user-story, use-case
- `module` - backend, frontend, infra, docs
- `priority` - alta, media, baja
- `status` - pending (inicial, preservar si ya existe)
- `acceptance` - Criterios de aceptación
- `documentation` - Rutas a docs referenciadas
- `dependencies` - IDs de features de las que depende
- `estimatedComplexity` - low, medium, high

### Paso 7: Analizar Dependencias
Para cada feature, identificar:

1. **Dependencias directas** - Features que DEBEN completarse antes
   - Modelo de datos requerido
   - Endpoint del que depende
   - Componente UI que necesita

2. **Dependencias circulares** - Detectar y alertar
   - Si A depende de B y B depende de A → error

3. **Feature sin dependencias** - Candidatas a empezar primero

4. **Cadena de dependencias** - Calcular profundidad
   - Feature con 0 dependencias = fondo del grafo
   - Feature con más dependencias = frentes del grafo

5. **Recommendación de orden** - Sugerir secuencia segura
   - Empezar por features sin dependencias
   - Luego las que solo dependen de completadas
   - Evitar bloquear features críticas

> **REGLA:** Una feature solo puede comenzarse si TODAS sus dependencias tienen status `done`.

### Paso 8: Generar JSON
1. Actualizar `feature_list.json` manteniendo estructura completa
2. Validar JSON válido
3. Mantener reglas del proyecto
4. Confirmar con usuario antes de guardar

## Formato de Feature

### Feature (funcionalidad)
```json
{
  "id": 1,
  "name": "project-crud",
  "title": "CRUD de Proyectos",
  "type": "feature",
  "description": "Crear, leer, actualizar y eliminar proyectos",
  "module": "backend",
  "priority": "alta",
  "status": "pending",
  "acceptance": [
    "POST /api/projects crea un proyecto válido",
    "GET /api/projects lista todos los proyectos",
    "PUT /api/projects/:id actualiza un proyecto",
    "DELETE /api/projects/:id cambia status a unavailable"
  ],
  "documentation": [
    "project-docs/api-endpoints.md",
    "project-docs/data-models.md"
  ],
  "dependencies": [],
  "estimatedComplexity": "medium"
}
```

### User Story
```json
{
  "id": 2,
  "name": "upload-evidence",
  "title": "Subir Evidencia",
  "type": "user-story",
  "description": "Como usuario, quiero subir evidencias para documentar el cumplimiento de reglas",
  "module": "backend",
  "priority": "alta",
  "status": "pending",
  "acceptance": [
    "Puedo subir archivos PDF, JPG, PNG",
    "Puedo agregar texto como evidencia",
    "Puedo agregar URLs como evidencia",
    "La evidencia se asocia a una regla específica"
  ],
  "documentation": [
    "project-docs/api-endpoints.md#evidencias"
  ],
  "dependencies": [1],
  "estimatedComplexity": "medium"
}
```

### Use Case
```json
{
  "id": 3,
  "name": "generate-report",
  "title": "Generar Reporte",
  "type": "use-case",
  "description": "Generar reporte Markdown con todas las evidencias del proyecto",
  "module": "backend",
  "priority": "media",
  "status": "pending",
  "acceptance": [
    "El reporte incluye todos los documentos y reglas",
    "Las evidencias se insertan en el Markdown",
    "Se puede exportar a PDF",
    "Se pueden agregar diagramas Mermaid"
  ],
  "documentation": [
    "project-docs/api-endpoints.md#reportes"
  ],
  "dependencies": [1, 2],
  "estimatedComplexity": "high"
}
```

## Reglas del Proyecto

```json
{
  "rules": {
    "one_feature_at_a_time": true,
    "require_tests_to_close": true,
    "require_approved_spec_to_implement": false,
    "valid_status": ["pending", "in_progress", "done", "blocked"],
    "update_on_completion": true
  }
}
```

## Ejemplo de Uso

```
Entrada:
- Directorio: /Users/user/proyecto/project-docs/
- Documentos: api-endpoints.md, data-models.md, architecture.md

Salida:
- /Users/user/proyecto/feature_list.json
```

## Notas
- **Idioma:** Español para descripciones, inglés para identifiers
- **Estado inicial:** Siempre "pending"
- **Referencias:** Incluir rutas a documentación fuente
- **Agrupación:** Organizar por módulo o área del sistema
- **Complejidad:** Estimar basado en alcance y dependencias

## Siguiente Paso
Una vez generado el `feature_list.json`, usar el skill `generate-spec` para crear especificaciones detalladas de cada feature:

```
Skill: generate-spec
Entrada: feature_list.json (generado en este paso)
Salida: specs/{feature}/spec.md
```
