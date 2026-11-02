# Módulo: infra (Infraestructura & Plataforma Base)

## Propósito
Proveer los cimientos de almacenamiento, pooling, migraciones versionadas y procesamiento asíncrono para toda la plataforma.

## Tareas Asignadas
- `INT-001`: `infra_database_setup` (PostgreSQL setup, pooling y migraciones automáticas).
- `INT-008`: `order_fulfillment_worker` (Worker consumidor con DLQ y reintentos).

## Entidades & Contratos
- `DatabaseMigrationRecord`: Registro de scripts ejecutados.
- `WorkerHealthStatus`: Healthcheck activo del consumidor RabbitMQ.
