# Reglas de Negocio Invariantes: knowledge-engine

### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta
- **Severidad**: Crítica
- **Restricción**: Todo ID de nodo Mermaid debe ser alfanumérico simple sin guiones (`nodeA`, `nodeGateway`). Toda etiqueta descriptiva debe estar entre comillas dobles (`["Texto seguro"]`).
- **Comportamiento ante Violación**: Error de renderizado en el navegador bloqueante.

### BR-KNOW-002: Invariante de Consulta Obligatoria Anti-Sesgo
- **Severidad**: Crítica
- **Restricción**: Antes de redactar specs o implementar código, los agentes DEBEN verificar la existencia de `project-docs/knowledge/`. Si existe, es obligatorio consultar `business-rules.md`, `coding-standards.md` y los módulos correspondientes.
- **Comportamiento ante Violación**: Queda terminantemente prohibido inventar librerías o dependencias externas no canónicas.
