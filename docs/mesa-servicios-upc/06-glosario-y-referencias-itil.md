# Glosario Oficial y Marco Normativo — Mesa de Servicios UPC

## 1. Glosario Oficial (Tabla 99)
| Término | Definición Oficial |
| :--- | :--- |
| **Actor** | Rol que desempeña una persona, sistema externo o evento de tiempo al interactuar en un caso de uso. |
| **Acuerdo de Nivel de Servicio (SLA)** | Compromiso documentado entre la OIS y la comunidad universitaria que fija tiempos máximos de primera respuesta y resolución. |
| **API** | Interfaz de programación de aplicaciones expuesta en REST/JSON bajo OpenAPI 3. |
| **Asistente virtual** | Componente conversacional con IA para soporte de nivel cero basado en artículos públicos aprobados. |
| **Base de conocimiento** | Repositorio versionado de artículos internos y públicos con síntomas y soluciones frecuentes. |
| **Bitácora de auditoría** | Registro cronológico e inalterable (solo adición) de acciones sensibles, conservado mínimo 5 años. |
| **Caso de uso** | Secuencia estructurada de interacciones entre actores y el sistema para lograr un objetivo (`CU-01`..`CU-17`). |
| **Criterio de aceptación** | Condición verificable que debe cumplirse para dar por satisfecho un requisito o historia de usuario. |
| **ERS (SRS)** | Especificación de Requisitos de Software (IEEE 830 / ISO/IEC/IEEE 29148). |
| **Escalamiento** | Traslado automático de un ticket a supervisión (Coordinador / Director TIC) cuando vence su SLA. |
| **Historia de usuario** | Descripción breve centrada en valor bajo criterios INVEST y estimada con Fibonacci (`HU-01`..`HU-23`). |
| **Incidencia** | Interrupción no planificada o degradación de la calidad de un servicio TIC existente (Incidente en ITIL 4). |
| **ITIL 4** | Marco de buenas prácticas para la gestión de servicios de TI publicado por AXELOS (2019). |
| **KPI** | Indicador clave de desempeño (volumen, tiempos promedio, cumplimiento SLA, reaperturas, satisfacción). |
| **Matriz de trazabilidad** | Tabla que vincula objetivos, interesados, RF, CU, HU, RNF y casos de prueba (`CP-01`..`CP-25`). |
| **Mesa de servicios** | Punto Único de Contacto (SPOC) oficial para incidencias y solicitudes TIC. |
| **OpenID Connect (OIDC)** | Protocolo de autenticación sobre OAuth 2.0 usado con el proveedor de identidad institucional UPC. |
| **Prioridad** | Nivel P1 Crítica, P2 Alta, P3 Media o P4 Baja calculado mediante Impacto x Urgencia (`OR-03`). |
| **Product backlog** | Lista priorizada de historias de usuario (164 puntos totales; 112 en prioridad Alta). |
| **Punto Único de Contacto (SPOC)** | Canal único y oficial entre la comunidad UPC y la Oficina de Informática y Sistemas. |
| **RBAC** | Control de acceso basado en roles (5 roles definidos). |
| **Solicitud de servicio** | Petición formal de un servicio ofertado en el catálogo (cuentas, software, préstamos). |
| **Soporte de nivel cero** | Atención resuelta sin intervención de un técnico mediante autoservicio, base de conocimiento o asistente virtual. |
| **Ticket** | Registro único (`MS-AAAA-NNNNNN`) con estado, SLA, historial y chat inmutable. |
| **WCAG 2.1 AA** | Pautas de accesibilidad web del W3C exigidas por la Resolución 1519 de 2020. |
| **WebSocket (WSS)** | Protocolo bidireccional seguro en puerto 443 usado para chat y notificaciones en tiempo real. |

## 2. Marco Normativo y Referencias Clave
- **ITIL 4:** AXELOS (2019), *ITIL Foundation: ITIL 4 edition*.
- **Ingeniería de Requisitos:** IEEE Std 830-1998, ISO/IEC/IEEE 29148:2018, SWEBOK v4 (Washizaki, 2024), Sommerville, Pressman, Cockburn, Cohn, Wiegers & Beatty.
- **Calidad y Seguridad:** ISO/IEC 25000 / ISO/IEC 25010:2023, OWASP Top 10:2021, W3C WCAG 2.1, RFC 6455 (WebSocket).
- **Legislación Colombiana:** Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 (protección de datos personales), Ley 1712 de 2014 (transparencia), Resolución 1519 de 2020 MinTIC (accesibilidad web y seguridad digital).
