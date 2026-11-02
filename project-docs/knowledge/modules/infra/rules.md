# Reglas del Módulo: infra

1. **`BR-INFRA-001`**: Las migraciones SQL deben ser deterministas, idempotentes e incluir siempre estrategia de reversión (rollback).
2. **`BR-INFRA-002`**: El pool de base de datos debe limitar el número máximo de conexiones a 25 para evitar agotamiento de recursos del cluster.
3. **`BR-ORDR-001`**: Tras 3 fallos en procesamiento de colas, los mensajes se enrutan obligatoriamente a `orders.dlq`.
