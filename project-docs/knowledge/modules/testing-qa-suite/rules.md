# Reglas de Negocio Invariantes: testing-qa-suite

### BR-TEST-001: 100% Tests en Verde para Cierre de Spec
- **Severidad**: Crítica
- **Restricción**: Ningún spec o tarea puede cerrarse como `done` si existe un solo test fallando en la suite.
- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y bloquea la reconciliación.

### BR-TEST-002: Cero Dependencias Pesadas en Runtime de Testing
- **Severidad**: Alta
- **Restricción**: Las pruebas unitarias deben ejecutarse usando el ejecutor nativo `node --test` para garantizar tiempos de respuesta inferiores a 500ms y cero bloat de dependencias.
- **Comportamiento ante Violación**: Se rechaza la instalación de frameworks redundantes.
