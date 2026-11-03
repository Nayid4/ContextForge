---
name: verification
description: Use when verifying a project is ready. Runs verify.sh and checks all requirements.
---

# Skill: Verificación de Proyecto

## Descripción
Verifica que un proyecto esté correctamente configurado y funcional antes de ser utilizado o desplegado.

## Uso
```bash
./verify.sh
```

## Qué verifica
1. **Entorno runtime** - Versiones requeridas de Node.js, npm, etc.
2. **Dependencias** - Paquetes instalados correctamente
3. **Servicios externos** - Conexión a bases de datos, APIs, etc.
4. **Build** - Compilación sin errores
5. **Tests** - Pruebas unitarias y de integración (si existen)
6. **Configuración** - Archivos de entorno y variables requeridas

## Estructura del reporte
```
========================================
  VERIFICACIÓN DE PROYECTO: [nombre]
  Fecha: [fecha]
========================================

[✓/✗] Nombre de verificación
      Detalle del resultado

========================================
  RESUMEN: X/Y verificaciones pasaron
========================================
```

## Códigos de salida
- `0` - Todas las verificaciones pasaron
- `1` - Al menos una verificación falló

## Personalización
Cada proyecto debe tener su propio `verify.sh` en la raíz del proyecto.
El script debe usar colores para facilitar la lectura:
- 🟢 Verde: OK
- 🔴 Rojo: Error
- 🟡 Amarillo: Advertencia
