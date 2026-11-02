---
name: technical-audit
description: Use when auditing a project to generate project-spec.yaml. Performs technical analysis of runtime, dependencies, services, and configuration.
---

# Skill: Auditoría Técnica de Proyecto

## Descripción
Realiza un barrido técnico completo de un proyecto y genera un archivo `project-spec.yaml` con todos los aspectos técnicos requeridos para verificación, despliegue y mantenimiento.

## Uso
Se debe proporcionar:
- **Ruta del proyecto** (obligatorio)
- **Referencia previa** (opcional) - Archivo YAML/JSON existente para complementar

## Salida
1. Archivo `project-spec.yaml` en la raíz del proyecto (para verify.sh, Docker y tooling CLI).
2. Archivo `project-docs/project-spec.json` (versión JSON estructurada para el visualizador del tablero de seguimiento).
3. Sincronización en `project-docs/data-fallback.js` (ejecutar `node project-docs/sync-data.js` para asegurar compatibilidad offline con doble clic).

## Estructura del YAML

```yaml
project:
  name: string
  description: string
  version: string
  type: backend | frontend | fullstack | library | cli

runtime:
  language: string          # node, python, java, etc.
  version: string           # versión requerida
  packageManager: string    # npm, yarn, pnpm, pip, etc.

environment:
  required:
    - name: string
      description: string
      required: boolean
      defaultValue: string (opcional)
  optional:
    - name: string
      description: string
      defaultValue: string

services:
  - name: string
    type: database | cache | queue | api | custom
    port: number
    required: boolean
    credentials:
      username: string
      password: string
      database: string (si aplica)

dependencies:
  system:                    # Dependencias del sistema
    - name: string
      version: string
      required: boolean
  packages:                  # Paquetes/librerías
    - name: string
      version: string
      required: boolean

structure:
  entryPoint: string
  srcDir: string
  testDir: string
  buildDir: string
  configFiles:
    - filename: string
      required: boolean
      description: string

checks:
  build:
    command: string
    timeout: number
  test:
    command: string
    timeout: number
    hasTests: boolean
  lint:
    command: string
    hasLint: boolean

docker:
  hasDockerfile: boolean
  hasCompose: boolean
  composePath: string
  services:
    - name: string
      port: number

scripts:
  dev: string
  build: string
  start: string
  test: string
  lint: string
  verify: string
```

## Proceso de Auditoría

1. **Analizar estructura de archivos**
   - Buscar package.json, requirements.txt, Cargo.toml, etc.
   - Identificar entry points
   - Detectar framework utilizado

2. **Verificar configuración**
   - Archivos .env, .env.example, .env.local
   - Variables de entorno requeridas
   - Archivos de configuración (tsconfig, webpack, vite, etc.)

3. **Detectar servicios**
   - Conexiones a bases de datos
   - APIs externas
   - Colas de mensajes
   - Caché

4. **Identificar dependencias**
   - Paquetes del sistema operativo
   - Dependencias de runtime
   - Herramientas de desarrollo

5. **Scripts disponibles**
   - Comandos en package.json o equivalentes
   - Scripts de build, test, lint

6. **Docker**
   - Dockerfile presente
   - docker-compose.yml
   - Servicios definidos

7. **Sincronización con el Tablero Visual (project-docs/)**
   - Generar el gemelo en formato JSON en `project-docs/project-spec.json`.
   - Ejecutar `node project-docs/sync-data.js` (o actualizar `project-docs/data-fallback.js`) para que el visor de Arquitectura & Stack refleje el stack de inmediato sin necesidad de recargar.

## Referencia Previa
Si se proporciona un archivo YAML/JSON existente:
1. Cargar la referencia
2. Fusionar con nuevos datos (override si hay conflicto)
3. Mantener campos no detectados

## Ejemplo de Uso

```
Entrada:
- Ruta: /Users/user/proyecto/backend
- Referencia: /docs/backend-spec.yaml (opcional)

Salida:
- /Users/user/proyecto/backend/project-spec.yaml
```

## Notas
- El YAML debe ser válido y parseable
- Usar formato estándar YAML (sin tabs)
- Incluir comentarios explicativos
- Mantener minimalismo: solo datos esenciales

## Siguiente Paso
Una vez generado el `project-spec.yaml`, ejecutar el skill `generate-verify` para crear el script de verificación:

```
Skill: generate-verify
Entrada: project-spec.yaml (generado en este paso)
Salida: verify.sh
```
