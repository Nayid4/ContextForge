---
name: generate-verify
description: Use when generating verify.sh script for a project. Creates verification script based on project-spec.yaml.
---

# Skill: Generador de verify.sh

## Descripción
Genera un script `verify.sh` personalizado para verificar que un proyecto esté correctamente configurado y funcional.

## Uso
Se debe proporcionar:
- **Ruta del proyecto** (obligatorio)
- **project-spec.yaml** (obligatorio) - Especificación técnica del proyecto (en `project-docs/project-spec.yaml` o raíz)

## Entrada
1. Ruta del directorio del proyecto
2. Archivo `project-docs/project-spec.yaml` (generado por skill `technical-audit`)

## Salida
Archivo `project-docs/verify.sh` (o en raíz según configuración del arnés), con permisos de ejecución.

## Estructura del Script

```bash
#!/bin/bash

# ========================================
# VERIFICACIÓN DE PROYECTO: [nombre]
# ========================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contadores
PASS=0
FAIL=0
WARN=0

# Funciones de verificación
check_pass() { echo -e "${GREEN}✓${NC} $1"; ((PASS++)); }
check_fail() { echo -e "${RED}✗${NC} $1"; ((FAIL++)); }
check_warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARN++)); }
```

## Secciones a Generar

### 1. Entorno Runtime
Basado en `runtime.language` y `runtime.version`:
```bash
# Verificar versión de Node.js/Python/etc
if command -v [runtime] &> /dev/null; then
    VERSION=$([runtime] -v)
    # Comparar con versión requerida
fi
```

### 2. Dependencias
Basado en `dependencies.packages` y `structure`:
```bash
# Verificar node_modules, venv, etc
# Verificar package.json, requirements.txt
# Contar paquetes instalados
```

### 3. Configuración
Basado en `environment.required` y `environment.optional`:
```bash
# Verificar .env
# Verificar variables requeridas
# Verificar variables opcionales
```

### 4. Servicios Externos
Basado en `services`:
```bash
# Verificar conexión a cada servicio
# MongoDB, Redis, PostgreSQL, etc
# Verificar puertos
```

### 5. Build
Basado en `checks.build`:
```bash
# Verificar comando de build
# Verificar archivos de salida
```

### 6. Tests
Basado en `checks.test`:
```bash
# Verificar si existen tests
# Ejecutar tests si existen
```

### 7. Docker
Basado en `docker`:
```bash
# Verificar Dockerfile
# Verificar docker-compose.yml
# Verificar servicios
```

### 8. Scripts
Basado en `scripts`:
```bash
# Verificar que los scripts existen en package.json o equivalente
```

## Generación del Script

### Desde project-spec.yaml
Leer cada sección y generar el código bash correspondiente:

```yaml
# Ejemplo de lectura:
runtime:
  language: node
  version: "20.x"

# Genera:
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    if [[ "$NODE_VERSION" == v20.* ]]; then
        check_pass "Node.js $NODE_VERSION (requerido: v20.x)"
    else
        check_warn "Node.js $NODE_VERSION (se recomienda: v20.x)"
    fi
else
    check_fail "Node.js no encontrado"
fi
```

### Servicios
```yaml
services:
  - name: mongodb
    type: database
    port: 27017

# Genera:
if curl -s localhost:27017 > /dev/null 2>&1; then
    check_pass "MongoDB reachable en puerto 27017"
else
    check_warn "MongoDB no reachable en puerto 27017"
fi
```

### Variables de Entorno
```yaml
environment:
  required:
    - name: MONGODB_URI
      description: URI de conexión a MongoDB
    - name: PORT
      description: Puerto del servidor
      defaultValue: "3000"

# Genera:
if grep -q "MONGODB_URI" .env; then
    check_pass "MONGODB_URI configurada"
else
    check_fail "MONGODB_URI no encontrada en .env"
fi
```

## Resumen Final

```bash
echo "========================================"
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}  RESUMEN: $PASS pasaron, $WARN advertencias, $FAIL errores${NC}"
    echo "  Estado: LISTO ✓"
else
    echo -e "${RED}  RESUMEN: $PASS pasaron, $WARN advertencias, $FAIL errores${NC}"
    echo "  Estado: NO LISTO ✗"
fi
echo "========================================"

[ $FAIL -eq 0 ] && exit 0 || exit 1
```

## Notas de Implementación
1. Usar `cd "$(dirname "$0")"` al inicio para permitir ejecución desde cualquier directorio
2. Mantener scripts compatibles con macOS y Linux
3. Evitar dependencias externas (solo usar comandos estándar del sistema)
4. Incluir comentarios explicativos en cada sección
5. Formato consistente con otros verify.sh del proyecto

## Siguiente Paso
Una vez generado el `verify.sh`, ejecutar la verificación:

```bash
# Desde el directorio del proyecto
./verify.sh

# O desde cualquier directorio
/ruta/al/proyecto/verify.sh
```

Si la verificación falla, corregir los errores y volver a ejecutar hasta obtener:
```
Estado: LISTO ✓
```

Finalmente, registrar la generación del script de verificación en el modelo Plane SQLite + Markdown:
```bash
node project-docs/cli.js ai log --skill generate-verify --role leader --type VERIFY_SCRIPT_GEN --summary "Generacion y validacion de script autonomo project-docs/verify.sh" --artifacts "project-docs/verify.sh"
node project-docs/sync-data.js
```
