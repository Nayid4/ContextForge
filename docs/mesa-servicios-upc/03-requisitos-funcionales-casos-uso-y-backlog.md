# Requisitos Funcionales (RF-01..25), Casos de Uso, Historias y Trazabilidad

## 1. Catálogo y Matriz de Trazabilidad Completa (RF -> CU -> HU -> RNF -> CP)
El sistema especifica **25 requisitos funcionales**, **17 casos de uso**, **23 historias de usuario** (**164 puntos de historia** en el Product Backlog; **112 puntos** de prioridad Alta para el MVP operativo) y **25 casos de prueba** (`CP-01`..`CP-25`).

| ID | Requisito Funcional | Prioridad | Caso de Uso | Historia (Pts) | RNF Asociados | Caso Prueba |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **RF-01** | Iniciar sesión con credenciales institucionales OIDC y cierre tras 30 min inactividad | Alta | CU-01 | HU-01 (5) | RNF-07, RNF-08 | CP-01 |
| **RF-02** | Gestionar usuarios (consultar, asignar rol/área, activar/inactivar conservando historial; no inactivar último admin) | Alta | CU-14 | HU-02 (5) | RNF-09 | CP-02 |
| **RF-03** | Gestionar roles y permisos RBAC (Usuario institucional, Técnico, Coordinador, Director TIC, Administrador) | Alta | CU-14 | HU-03 (8) | RNF-07, RNF-09 | CP-03 |
| **RF-04** | Registrar ticket (`MS-AAAA-NNNNNN`, tipo, servicio, sede, ubicación, asunto, descripción, hasta 5 adjuntos <= 10 MB) | Alta | CU-02 | HU-04 (8) | RNF-01, RNF-10 | CP-04 |
| **RF-05** | Priorizar ticket automáticamente por matriz Impacto x Urgencia (`OR-03`) | Alta | CU-02, CU-06 | HU-05 (5) | RNF-15 | CP-05 |
| **RF-06** | Asignar ticket automáticamente al área y técnico con menor carga (< 10s, desempate por antigüedad) | Alta | CU-06 | HU-06 (13) | RNF-03 | CP-06 |
| **RF-07** | Calcular y controlar SLA en horario hábil (`OR-04`), pausa en `En espera` y semáforo verde/amarillo/rojo | Alta | CU-11 | HU-07 (13) | RNF-15 | CP-07 |
| **RF-08** | Alertar al técnico al 75% del SLA y escalar tickets vencidos al coordinador (verificación cada minuto) | Alta | CU-11 | HU-07 (13) | RNF-04 | CP-08 |
| **RF-09** | Consultar estado e historial cronológico de tickets propios (filtros y búsqueda por consecutivo) | Alta | CU-03 | HU-08 (3) | RNF-01, RNF-12 | CP-09 |
| **RF-10** | Gestionar el ciclo de vida del ticket (8 estados, solo transiciones válidas, comentario obligatorio en `En espera`/`Anulado`) | Alta | CU-07 | HU-09 (5) | RNF-09 | CP-10 |
| **RF-11** | Reasignar ticket entre técnicos o áreas con motivo obligatorio sin reiniciar SLA | Media | CU-08 | HU-10 (3) | RNF-09 | CP-11 |
| **RF-12** | Chat en tiempo real por ticket (WebSocket/polling, indicador de leído, inmutable, solo lectura al cerrar) | Alta | CU-05 | HU-11 (13) | RNF-02, RNF-08 | CP-12 |
| **RF-13** | Adjuntar evidencias en registro y chat (incluyendo cámara móvil; descarga solo participantes autorizados) | Media | CU-02, CU-05 | HU-04, HU-11 | RNF-08 | CP-13 |
| **RF-14** | Enviar notificaciones en plataforma (< 5s) y por correo institucional (eventos del ticket y chat) | Media | CU-06, CU-11 | HU-12 (5) | RNF-04 | CP-14 |
| **RF-15** | Documentar solución obligatoria (diagnóstico, solución >= 20 chars, categoría cierre; proponer artículo KB) | Alta | CU-07 | HU-13 (5) | RNF-09 | CP-15 |
| **RF-16** | Confirmar solución o reabrir ticket (cierre automático tras 3 días hábiles sin respuesta) | Alta | CU-09 | HU-14 (3) | RNF-15 | CP-16 |
| **RF-17** | Calificar el servicio al cierre (escala 1–5, opcional, 5 días hábiles; nota 1–2 pide comentario y avisa al coordinador) | Baja | CU-10 | HU-15 (2) | RNF-10 | CP-17 |
| **RF-18** | Atender consultas con asistente virtual IA usando exclusivamente artículos públicos aprobados con cita | Alta | CU-04 | HU-16 (13) | RNF-06, RNF-13 | CP-18 |
| **RF-19** | Crear tickets de forma guiada (con resumen editable y confirmación previa) y consultar estado propio desde el asistente | Media | CU-04 | HU-17 (8) | RNF-06 | CP-19 |
| **RF-20** | Transferir a atención humana ("Hablar con una persona" siempre visible; crea ticket con transcripción completa) | Media | CU-04 | HU-18 (5) | RNF-06 | CP-20 |
| **RF-21** | Gestionar base de conocimiento (Borrador -> En revisión -> Publicado -> Retirado; artículos internos y públicos versionados) | Media | CU-16 | HU-19 (8) | RNF-14 | CP-21 |
| **RF-22** | Visualizar tablero de indicadores segmentado por rol (técnico: propios; coordinador: área; director/admin: global) | Media | CU-12 | HU-20 (13) | RNF-01, RNF-07 | CP-22 |
| **RF-23** | Generar y exportar reportes PDF y XLSX (< 30s hasta 10.000 tickets; > 10.000 en segundo plano) | Media | CU-13 | HU-21 (8) | RNF-03 | CP-23 |
| **RF-24** | Configurar catálogo de servicios, áreas técnicas, sedes, calendario hábil y tiempos de SLA (no inactivar área con abiertos) | Alta | CU-15 | HU-22 (8) | RNF-14 | CP-24 |
| **RF-25** | Registrar bitácora de auditoría append-only (fecha, usuario, IP, acción, entidad, valor anterior/nuevo; exportar XLSX) | Alta | CU-17 | HU-23 (5) | RNF-09 | CP-25 |

## 2. Reglas Clave de los Casos de Uso Destacados
- **CU-01 (Iniciar sesión):** Si es el primer ingreso de una cuenta institucional válida, el sistema crea el perfil automáticamente con rol `Usuario institucional`. Cuentas de dominios externos son rechazadas. Tras 5 intentos fallidos aplica bloqueo del proveedor de identidad.
- **CU-02 (Registrar ticket):** Mientras el usuario elige servicio, se sugieren artículos públicos; si el usuario pulsa *"Mi problema se resolvió"*, se registra resolución por autoservicio sin crear ticket. Si falla la red al guardar, el formulario conserva los datos en el navegador.
- **CU-03 (Consultar tickets):** Si se busca un número perteneciente a otro usuario, el sistema responde igual que si no existiera (sin filtrar existencia).
- **CU-04 (Asistente virtual):** Timeout estricto de **15 segundos** (`RNF-06`); si no responde, ofrece el formulario de nuevo ticket. Si el usuario indica **dos veces** que la respuesta no le sirve, ofrece transferencia directa a humano (`HU-18`).
- **CU-14 (Usuarios y roles):** Impide inactivar al último administrador activo y exige reasignar tickets abiertos antes de inactivar a un técnico.
- **CU-17 (Auditoría):** Ningún rol puede modificar ni eliminar registros; la consulta y exportación también se auditan. Exportaciones de más de **50.000 registros** corren en segundo plano.
