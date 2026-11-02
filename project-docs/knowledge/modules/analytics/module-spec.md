# Módulo: analytics (Analítica & Streams de Eventos)

## Propósito
Ingestar eventos de navegación, clics y compras de forma no bloqueante y exportar métricas Prometheus en `/metrics`.

## Tareas Asignadas
- `INT-009`: `analytics_event_stream` (Buffer en memoria, compresión gzip, métricas Prometheus).

## Reglas
- **`BR-ANLT-001`**: La captura de analítica jamás bloquea peticiones HTTP del usuario.
- **`BR-ANLT-002`**: Exportación en `/metrics` conforme al estándar OpenMetrics.
