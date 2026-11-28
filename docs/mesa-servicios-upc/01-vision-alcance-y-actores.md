# Visión, Alcance, Problemática e Interesados — Mesa de Servicios UPC

> **Autores ERS:** Kathy Carolina Sagbini Daza & Nayid Junior Castellar Agamez  
> **Institución:** Universidad Popular del Cesar (UPC), Especialización en Ingeniería de Software, Valledupar (2026)  
> **Referencias normativas:** IEEE 830, ISO/IEC/IEEE 29148, ISO/IEC 25010, ITIL 4 (AXELOS).

## 1. Descripción del Producto (SPOC ITIL v4)
El **Sistema Web de Mesa de Servicios basado en ITIL v4** actúa como el **Punto Único de Contacto (SPOC)** oficial entre la comunidad universitaria de la Universidad Popular del Cesar y la **Oficina de Informática y Sistemas (OIS)**.

Diferencia formalmente los dos tipos de casos de ITIL 4:
- **Incidencias:** Interrupciones o degradaciones no planificadas de un servicio TIC existente (ej. caída de red en un bloque académico, videoproyector dañado en clase).
- **Solicitudes de servicio:** Peticiones de servicios ofertados en el catálogo (ej. creación de cuenta, instalación de software, préstamo de equipo).

### Cinco Componentes Coordinados
1. **Gestión de tickets:** Formulario web y guiado por IA, adjuntos y ciclo de vida de 8 estados.
2. **Motor de asignación y acuerdos de nivel de servicio (SLA):** Priorización automática (`OR-03`), enrutamiento por área, asignación al técnico con menor carga y control de SLA en horario hábil (`OR-04`).
3. **Chat en tiempo real por ticket:** Conversación institucional con evidencias dentro del ticket (reemplaza el WhatsApp personal).
4. **Asistente virtual con inteligencia artificial (Soporte Nivel 0):** Responde consultas frecuentes usando artículos públicos aprobados, consulta estado de tickets y ayuda a crearlos con transferencia a humano.
5. **Tablero de indicadores y administración:** Métricas segmentadas por rol, reportes PDF/XLSX, catálogo de servicios/SLA y bitácora de auditoría inmutable.

## 2. Declaración de la Visión (Tabla 1)
| Elemento | Declaración |
| :--- | :--- |
| **PARA** | Estudiantes, docentes, personal administrativo de la UPC y equipo de la Oficina de Informática y Sistemas |
| **QUIENES** | Necesitan reportar fallas tecnológicas y solicitar servicios TIC por un medio oficial, conocer el estado de su caso y obtener solución en tiempos razonables |
| **EL** | Sistema Web de Mesa de Servicios basado en ITIL v4 |
| **QUE ES** | Una plataforma web institucional de gestión de incidencias y solicitudes de soporte |
| **QUE** | Centraliza la atención en un SPOC, asigna casos automáticamente con SLA controlado, conserva el historial en el ticket, resuelve dudas frecuentes con IA y entrega indicadores por rol |
| **A DIFERENCIA DE** | La atención informal presencial, telefónica o por WhatsApp personal de técnicos contratistas con pérdida de memoria técnica cada semestre |
| **NUESTRO PRODUCTO** | Deja la memoria técnica en manos de la institución, da visibilidad al usuario y entrega cifras medibles a la dirección |

## 3. Problemática y su Impacto
En la UPC buena parte del personal técnico es **contratista** y rota cada semestre; al retirarse se llevan en su teléfono personal diagnósticos y soluciones. Esto genera:
- **Pérdida del conocimiento técnico:** Fallas ya resueltas se diagnostican desde cero.
- **Incertidumbre del usuario:** Duplicación de solicitudes al no saber quién atiende el caso ni cuándo se resolverá.
- **Asignación desigual del trabajo:** Saturación de los técnicos más conocidos sin priorización objetiva.
- **Saturación por consultas repetitivas:** Tiempo técnico consumido en contraseñas y Wi-Fi resolubles por autoservicio.
- **Ausencia de métricas:** Imposibilidad de medir cumplimiento SLA o justificar presupuesto/contratación.
- **Riesgo de protección de datos:** Intercambio de capturas y credenciales en mensajería no institucional.

## 4. Objetivos del Sistema (OS-01 a OS-06)
- **OS-01 (Centralización SPOC):** Canal único de registro, notificaciones y soporte guiado (`RF-04`, `RF-14`, `RF-19`).
- **OS-02 (Asignación y SLA):** Priorización, enrutamiento, balanceo, control SLA, escalamiento y configuración (`RF-05`, `RF-06`, `RF-07`, `RF-08`, `RF-11`, `RF-24`).
- **OS-03 (Trazabilidad y Ciclo de Vida):** Consulta de historial, estados controlados, chat en tiempo real, adjuntos, documentación de solución y confirmación/reapertura (`RF-09`, `RF-10`, `RF-12`, `RF-13`, `RF-15`, `RF-16`).
- **OS-04 (Autoservicio con IA y Conocimiento):** Asistente virtual Nivel 0, creación/consulta guiada, transferencia a humano y base de conocimiento (`RF-18`, `RF-19`, `RF-20`, `RF-21`).
- **OS-05 (Medición y Decisión):** Encuesta de satisfacción, tablero por rol y reportes PDF/XLSX (`RF-17`, `RF-22`, `RF-23`).
- **OS-06 (Gobernanza y Seguridad):** Acceso institucional OIDC, gestión de usuarios, RBAC y bitácora inmutable (`RF-01`, `RF-02`, `RF-03`, `RF-25`).

## 5. Alcance y Exclusiones
### Incluido en el Alcance
- Autenticación institucional (OIDC) y RBAC para 5 roles: **Usuario institucional**, **Técnico de soporte**, **Coordinador**, **Director de TIC** y **Administrador**.
- Registro web o guiado por IA con consecutivo `MS-AAAA-NNNNNN`, adjuntos (hasta 5 archivos de 10 MB: JPG, PNG, PDF, DOCX, XLSX), priorización `OR-03`, asignación automática y SLA `OR-04`.
- Chat en tiempo real por ticket (WebSocket con fallback polling cada 5s), notificaciones en plataforma y correo.
- Asistente virtual IA basado exclusivamente en artículos públicos aprobados + base de conocimiento con artículos internos y públicos.
- Tablero por rol, reportes PDF/XLSX, administración de catálogo/calendario/SLA y bitácora de auditoría.

### Fuera del Alcance (Fases Posteriores)
- Aplicaciones móviles nativas Android/iOS (se usa diseño web adaptable desde 360px).
- Gestión de activos/CMDB, inventario de repuestos o compras de equipos.
- Prácticas ITIL de gestión de problemas, cambios y versiones.
- Integración con sistemas académicos o financieros (solo OIDC y correo SMTP).
- Entrenamiento de modelos de IA propios (se consume API REST de un proveedor externo).

## 6. Interesados y Actores del Sistema
| Interesado / Actor | Rol en el Proyecto | Interés Principal |
| :--- | :--- | :--- |
| **Rectoría** | Patrocinador (Sponsor) | Respaldar el canal oficial e indicadores de gestión institucional |
| **Vicerrectoría Administrativa y Financiera** | Tomador de decisiones | Justificar inversión, reducir reprocesos y optimizar talento técnico |
| **Director de la OIS (Director de TIC)** | Dueño de producto / Usuario directo | Centralizar atención, retener conocimiento y medir SLA globales |
| **Coordinador de Mesa de Servicios** | Usuario directo | Supervisar colas, reasignar, atender escalamientos y aprobar artículos |
| **Técnicos de soporte (contratistas)** | Usuarios directos | Bandeja priorizada por SLA, chat institucional y memoria de soluciones |
| **Estudiantes, Docentes y Administrativos** | Usuarios institucionales | Reportar desde el celular en < 3 min, autoservicio IA y trazabilidad |
| **Administrador del sistema** | Usuario directo | Configurar usuarios, roles RBAC, catálogo, sedes, calendario, SLA y auditoría |
| **Oficina de Control Interno / Jurídica** | Entes de control | Evidencia verificable en bitácora de auditoría y cumplimiento Ley 1581 / Ley 1712 |
| **Actores secundarios (sistemas)** | Proveedor de identidad OIDC, Servidor de correo SMTP, Servicio de IA, Temporizador del sistema | Autenticación, notificaciones, respuestas Nivel 0 y control automático cada minuto |
