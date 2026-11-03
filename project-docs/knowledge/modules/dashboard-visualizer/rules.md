# Reglas de Negocio Invariantes: dashboard-visualizer

### BR-DASH-001: Compatibilidad 100% Offline (Zero-Server Fallback)
- **Severidad**: Crítica
- **Restricción**: El tablero debe poder abrirse con doble clic directamente en `project-docs/index.html` bajo el protocolo `file:///` sin requerir servidor HTTP ni fallar por CORS.
- **Comportamiento ante Violación**: `sync-data.js` genera obligatoriamente `project-docs/data-fallback.js` antes de cualquier compilación.

### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo
- **Severidad**: Alta
- **Fórmula**: $\text{Ratio} = \frac{\text{scrollTop}}{\text{scrollHeight} - \text{clientHeight}}$ con flags de exclusión mutua `isScrollingFromEditor` e `isScrollingFromPreview`.
- **Comportamiento ante Violación**: Bloqueo de scroll o bucles de eventos infinitos entre paneles.
