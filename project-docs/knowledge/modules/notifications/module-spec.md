# Módulo: notifications (Comunicaciones & Notificaciones)

## Propósito
Envío de emails transaccionales con plantillas HTML responsivas y seguras contra inyección, y gestión de reintentos SMTP/SES.

## Tareas Asignadas
- `INT-010`: `notification_service_email` (Plantillas responsivas, reintentos diferidos, unsubscribe).

## Reglas
- **`BR-NOTF-001`**: Sanitización estricta de variables en plantillas HTML.
- **`BR-NOTF-002`**: Manejo de rebotes temporales con reintento a los 5 y 15 minutos.
