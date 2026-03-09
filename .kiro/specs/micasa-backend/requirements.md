# Documento de Requisitos: Backend Sistema de Gestión de Iglesia MICASA

## Introducción

El sistema MICASA es un backend RESTful para la gestión integral de una iglesia, que permite administrar personas, usuarios, roles, permisos, ministerios, familias, contactos, eventos y asistencias. El sistema proporciona autenticación segura mediante JWT, autorización basada en roles y permisos, auditoría completa de cambios y documentación automática de la API.

## Glosario

- **Sistema**: El backend del sistema MICASA
- **Usuario**: Persona con credenciales de acceso al sistema
- **Persona**: Individuo registrado en la base de datos de la iglesia
- **Rol**: Conjunto de permisos agrupados bajo un nombre
- **Permiso**: Autorización específica para realizar una acción en el sistema
- **Ministerio**: Grupo de trabajo o servicio dentro de la iglesia
- **Familia**: Grupo de personas relacionadas por parentesco
- **Evento**: Actividad programada de la iglesia
- **Asistencia**: Registro de presencia de una persona en un evento
- **Token_JWT**: Token de autenticación JSON Web Token
- **Auditoría**: Registro histórico de cambios en el sistema
- **API**: Interfaz de programación de aplicaciones
- **Endpoint**: Punto de acceso específico de la API
- **Soft_Delete**: Eliminación lógica mediante cambio de estado

## Requisitos

### Requisito 1: Autenticación de Usuarios

**User Story:** Como usuario del sistema, quiero autenticarme con mis credenciales, para que pueda acceder de forma segura a las funcionalidades del sistema.

#### Acceptance Criteria

1. WHEN un usuario proporciona credenciales válidas THEN el Sistema SHALL generar un token JWT con duración de 8 horas
2. WHEN un usuario proporciona credenciales inválidas THEN el Sistema SHALL retornar error 401 sin revelar si el usuario existe
3. WHEN un usuario inactivo intenta autenticarse THEN el Sistema SHALL rechazar el acceso con error 401
4. WHEN se genera un token JWT THEN el Sistema SHALL incluir userId, personaId, username, roles y permisos en el payload
5. WHEN un usuario se autentica exitosamente THEN el Sistema SHALL actualizar el campo ultimo_acceso del usuario
6. WHEN un usuario cierra sesión THEN el Sistema SHALL invalidar el token actual
7. THE Sistema SHALL hashear todas las contraseñas usando bcrypt con factor de costo mínimo de 10

### Requisito 2: Autorización y Control de Acceso

**User Story:** Como administrador del sistema, quiero controlar el acceso a recursos mediante roles y permisos, para que los usuarios solo puedan realizar acciones autorizadas.

#### Acceptance Criteria

1. WHEN un usuario accede a un endpoint protegido THEN el Sistema SHALL verificar la presencia y validez del token JWT
2. WHEN un token JWT ha expirado THEN el Sistema SHALL retornar error 401 con mensaje "Token expirado"
3. WHEN un usuario intenta acceder a un recurso sin el permiso requerido THEN el Sistema SHALL retornar error 403
4. WHEN se verifica un permiso THEN el Sistema SHALL considerar todos los permisos activos de todos los roles activos del usuario
5. THE Sistema SHALL validar que el usuario esté activo antes de verificar permisos
6. WHEN se asigna un rol a un usuario THEN el Sistema SHALL verificar que tanto el usuario como el rol estén activos
7. WHEN se asigna un permiso a un rol THEN el Sistema SHALL verificar que tanto el rol como el permiso estén activos

### Requisito 3: Gestión de Personas

**User Story:** Como usuario autorizado, quiero gestionar la información de las personas de la iglesia, para que pueda mantener actualizada la base de datos de miembros.

#### Acceptance Criteria

1. WHEN se crea una persona THEN el Sistema SHALL validar que primer_nombre y primer_apellido no estén vacíos
2. WHEN se crea una persona THEN el Sistema SHALL validar que la identificación sea única en el sistema
3. WHEN una persona está marcada como bautizada THEN el Sistema SHALL validar que fecha_bautizo sea posterior a fecha_nacimiento
4. WHEN se proporciona un email THEN el Sistema SHALL validar que tenga formato válido
5. THE Sistema SHALL permitir solo los valores M o F para el campo genero
6. THE Sistema SHALL permitir solo los valores CC, TI, CE, PAS, RC para tipo_identificacion
7. THE Sistema SHALL permitir solo los valores S, C, V, D, U para estado_civil
8. WHEN se elimina una persona THEN el Sistema SHALL realizar eliminación lógica estableciendo estado a false
9. WHEN se consultan personas THEN el Sistema SHALL retornar resultados paginados con máximo 100 registros por página
10. THE Sistema SHALL permitir búsqueda de personas por identificación y por nombre

### Requisito 4: Gestión de Usuarios

**User Story:** Como administrador, quiero gestionar usuarios del sistema, para que pueda controlar quién tiene acceso y con qué permisos.

#### Acceptance Criteria

1. WHEN se crea un usuario THEN el Sistema SHALL validar que el nombre de usuario sea único
2. WHEN se crea un usuario THEN el Sistema SHALL validar que id_persona sea único (un usuario por persona)
3. WHEN se crea un usuario THEN el Sistema SHALL validar que el nombre de usuario tenga mínimo 4 caracteres
4. WHEN se crea un usuario THEN el Sistema SHALL validar que la contraseña tenga mínimo 8 caracteres antes de hashear
5. THE Sistema SHALL almacenar contraseñas como hash bcrypt, nunca en texto plano
6. THE Sistema SHALL nunca retornar el hash de contraseña en respuestas de la API
7. WHEN se asigna un rol a un usuario THEN el Sistema SHALL reactivar la asignación si existía previamente pero estaba inactiva
8. WHEN se consultan roles de un usuario THEN el Sistema SHALL retornar solo roles activos
9. WHEN se consultan permisos de un usuario THEN el Sistema SHALL retornar la unión de todos los permisos de sus roles activos sin duplicados

### Requisito 5: Gestión de Roles y Permisos

**User Story:** Como administrador, quiero definir roles y permisos, para que pueda configurar el control de acceso del sistema de forma flexible.

#### Acceptance Criteria

1. WHEN se crea un rol THEN el Sistema SHALL validar que el nombre sea único
2. WHEN se crea un permiso THEN el Sistema SHALL validar que el nombre sea único
3. THE Sistema SHALL requerir que todo permiso tenga un módulo asociado
4. WHEN se asigna un permiso a un rol THEN el Sistema SHALL verificar que ambos existan y estén activos
5. WHEN se consultan permisos por módulo THEN el Sistema SHALL retornar solo permisos activos de ese módulo
6. THE Sistema SHALL seguir el formato MODULO_ACCION para nombres de permisos (ej: PERSONAS_CREATE)

### Requisito 6: Gestión de Ministerios

**User Story:** Como líder de ministerio, quiero gestionar los miembros y actividades de mi ministerio, para que pueda organizar el trabajo del grupo.

#### Acceptance Criteria

1. WHEN se crea un ministerio THEN el Sistema SHALL validar que el nombre sea único
2. WHEN se asigna un líder a un ministerio THEN el Sistema SHALL validar que la persona exista
3. WHEN se agrega una persona a un ministerio THEN el Sistema SHALL permitir especificar el cargo
4. WHEN se consultan miembros de un ministerio THEN el Sistema SHALL retornar solo miembros activos
5. THE Sistema SHALL permitir actualizar el cargo de un miembro del ministerio
6. WHEN se elimina un ministerio THEN el Sistema SHALL realizar eliminación lógica estableciendo estado a false

### Requisito 7: Gestión de Familias

**User Story:** Como usuario autorizado, quiero gestionar familias y sus relaciones, para que pueda mantener el registro de grupos familiares de la iglesia.

#### Acceptance Criteria

1. WHEN se crea una familia THEN el Sistema SHALL requerir un nombre
2. WHEN se agrega un miembro a una familia THEN el Sistema SHALL requerir especificar el parentesco
3. THE Sistema SHALL permitir solo los valores PADRE, MADRE, HIJO, HIJA, ESPOSO, ESPOSA, ABUELO, ABUELA, NIETO, NIETA, OTRO para parentesco
4. WHEN se marca una persona como cabeza de familia THEN el Sistema SHALL validar que sea la única cabeza de esa familia
5. THE Sistema SHALL requerir que toda familia tenga exactamente una cabeza de familia
6. WHEN se consultan miembros de una familia THEN el Sistema SHALL incluir información de parentesco

### Requisito 8: Gestión de Contactos

**User Story:** Como usuario autorizado, quiero gestionar contactos adicionales de las personas, para que pueda mantener múltiples formas de comunicación.

#### Acceptance Criteria

1. WHEN se crea un contacto THEN el Sistema SHALL requerir tipo_contacto y valor
2. THE Sistema SHALL permitir solo los valores TELEFONO, EMAIL, WHATSAPP, OTRO para tipo_contacto
3. WHEN tipo_contacto es EMAIL THEN el Sistema SHALL validar que valor tenga formato de email válido
4. WHEN se marca un contacto como principal THEN el Sistema SHALL validar que sea el único principal de ese tipo para esa persona
5. THE Sistema SHALL permitir múltiples contactos por persona
6. WHEN se consultan contactos THEN el Sistema SHALL retornar solo contactos activos

### Requisito 9: Gestión de Eventos

**User Story:** Como organizador de eventos, quiero crear y gestionar eventos de la iglesia, para que pueda planificar y dar seguimiento a las actividades.

#### Acceptance Criteria

1. WHEN se crea un evento THEN el Sistema SHALL requerir nombre y fecha_inicio
2. WHEN se proporciona fecha_fin THEN el Sistema SHALL validar que sea posterior o igual a fecha_inicio
3. THE Sistema SHALL permitir solo los valores CULTO, REUNION, CONFERENCIA, RETIRO, SERVICIO, OTRO para tipo_evento
4. WHEN se asocia un evento a un ministerio THEN el Sistema SHALL validar que el ministerio exista
5. WHEN se consultan eventos por rango de fechas THEN el Sistema SHALL retornar solo eventos dentro del rango especificado
6. WHEN se consultan eventos por ministerio THEN el Sistema SHALL retornar solo eventos de ese ministerio
7. WHEN se elimina un evento THEN el Sistema SHALL realizar eliminación lógica estableciendo estado a false

### Requisito 10: Registro de Asistencias

**User Story:** Como usuario autorizado, quiero registrar asistencias a eventos, para que pueda llevar control de participación en actividades.

#### Acceptance Criteria

1. WHEN se registra asistencia THEN el Sistema SHALL validar que el evento exista
2. WHEN se registra asistencia THEN el Sistema SHALL validar que todas las personas existan
3. WHEN se registra asistencia para una persona que ya tiene registro THEN el Sistema SHALL actualizar el registro existente
4. THE Sistema SHALL validar que la combinación id_evento + id_persona sea única
5. WHEN se registra asistencia THEN el Sistema SHALL permitir especificar si asistió o no
6. WHEN se registra asistencia THEN el Sistema SHALL permitir agregar observaciones opcionales
7. WHEN se consultan asistencias de un evento THEN el Sistema SHALL retornar todos los registros con información de la persona

### Requisito 11: Estadísticas de Asistencia

**User Story:** Como líder de ministerio, quiero consultar estadísticas de asistencia, para que pueda evaluar la participación en eventos.

#### Acceptance Criteria

1. WHEN se consultan estadísticas de un evento THEN el Sistema SHALL calcular total de registros y total de asistentes
2. WHEN se consultan estadísticas de un evento THEN el Sistema SHALL calcular el porcentaje de asistencia
3. WHEN se filtran estadísticas por ministerio THEN el Sistema SHALL incluir solo personas de ese ministerio
4. WHEN se filtran estadísticas por rango de fechas THEN el Sistema SHALL incluir solo eventos en ese rango
5. THE Sistema SHALL calcular estadísticas usando agregaciones de base de datos, no en memoria

### Requisito 12: Auditoría de Cambios

**User Story:** Como auditor del sistema, quiero consultar el historial de cambios, para que pueda rastrear modificaciones y mantener trazabilidad.

#### Acceptance Criteria

1. WHEN se crea un registro THEN el Sistema SHALL crear entrada de auditoría con acción INSERT y datos_nuevos
2. WHEN se actualiza un registro THEN el Sistema SHALL crear entrada de auditoría con acción UPDATE, datos_anteriores y datos_nuevos
3. WHEN se elimina un registro THEN el Sistema SHALL crear entrada de auditoría con acción DELETE y datos_anteriores
4. THE Sistema SHALL registrar el id_usuario que realizó la operación si está disponible
5. THE Sistema SHALL registrar la fecha_accion automáticamente
6. WHEN se consulta auditoría por tabla THEN el Sistema SHALL retornar solo registros de esa tabla
7. WHEN se consulta auditoría por usuario THEN el Sistema SHALL retornar solo registros de ese usuario
8. WHEN se consulta auditoría por rango de fechas THEN el Sistema SHALL retornar solo registros en ese rango
9. WHEN se consulta historial de un registro THEN el Sistema SHALL retornar todos los cambios ordenados cronológicamente

### Requisito 13: Validación de Datos

**User Story:** Como desarrollador del sistema, quiero que todos los datos de entrada sean validados, para que se mantenga la integridad de la información.

#### Acceptance Criteria

1. WHEN se reciben datos inválidos THEN el Sistema SHALL retornar error 400 con detalles de validación
2. WHEN falla la validación THEN el Sistema SHALL incluir el campo y mensaje específico para cada error
3. THE Sistema SHALL validar tipos de datos antes de procesar solicitudes
4. THE Sistema SHALL validar longitudes máximas de campos de texto
5. THE Sistema SHALL validar formatos de email, fechas y otros campos especiales
6. THE Sistema SHALL sanitizar datos de entrada para prevenir inyección
7. WHEN se validan fechas THEN el Sistema SHALL aceptar formato ISO 8601 o objetos Date

### Requisito 14: Manejo de Errores

**User Story:** Como usuario del sistema, quiero recibir mensajes de error claros, para que pueda entender y corregir problemas.

#### Acceptance Criteria

1. WHEN ocurre un error de validación THEN el Sistema SHALL retornar código 400 con detalles del error
2. WHEN ocurre un error de autenticación THEN el Sistema SHALL retornar código 401 con mensaje apropiado
3. WHEN ocurre un error de autorización THEN el Sistema SHALL retornar código 403 con mensaje apropiado
4. WHEN no se encuentra un recurso THEN el Sistema SHALL retornar código 404 con mensaje apropiado
5. WHEN ocurre violación de unicidad THEN el Sistema SHALL retornar código 409 con el campo que viola la restricción
6. WHEN ocurre error interno THEN el Sistema SHALL retornar código 500 sin exponer detalles técnicos al cliente
7. THE Sistema SHALL registrar todos los errores en logs del servidor
8. THE Sistema SHALL nunca exponer información sensible en mensajes de error

### Requisito 15: Paginación de Resultados

**User Story:** Como usuario del sistema, quiero que las listas grandes estén paginadas, para que el sistema responda eficientemente.

#### Acceptance Criteria

1. WHEN se consulta una lista de recursos THEN el Sistema SHALL retornar resultados paginados
2. THE Sistema SHALL usar página 1 como valor por defecto
3. THE Sistema SHALL usar límite de 10 registros como valor por defecto
4. THE Sistema SHALL limitar el máximo de registros por página a 100
5. WHEN se retornan resultados paginados THEN el Sistema SHALL incluir metadata con total, page, limit, totalPages, hasNextPage, hasPrevPage
6. THE Sistema SHALL calcular totalPages como ceil(total / limit)
7. THE Sistema SHALL validar que page sea mayor o igual a 1
8. THE Sistema SHALL validar que limit esté entre 1 y 100

### Requisito 16: Seguridad de la API

**User Story:** Como administrador de seguridad, quiero que la API implemente medidas de protección, para que el sistema sea resistente a ataques comunes.

#### Acceptance Criteria

1. THE Sistema SHALL implementar rate limiting de 100 requests por minuto por IP
2. THE Sistema SHALL implementar rate limiting de 5 intentos de login por minuto por IP
3. THE Sistema SHALL usar HTTPS en producción
4. THE Sistema SHALL implementar headers de seguridad usando helmet
5. THE Sistema SHALL configurar CORS para permitir solo orígenes confiables
6. THE Sistema SHALL nunca usar wildcard (*) en CORS en producción
7. THE Sistema SHALL registrar intentos de login fallidos
8. THE Sistema SHALL registrar accesos denegados por falta de permisos
9. THE Sistema SHALL comprimir respuestas HTTP usando gzip

### Requisito 17: Documentación de la API

**User Story:** Como desarrollador frontend, quiero acceder a documentación interactiva de la API, para que pueda integrarme fácilmente con el backend.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar documentación Swagger/OpenAPI en /api-docs
2. WHEN se accede a la documentación THEN el Sistema SHALL mostrar todos los endpoints disponibles
3. WHEN se accede a la documentación THEN el Sistema SHALL mostrar esquemas de request y response
4. WHEN se accede a la documentación THEN el Sistema SHALL permitir probar endpoints interactivamente
5. THE Sistema SHALL documentar códigos de respuesta HTTP para cada endpoint
6. THE Sistema SHALL documentar parámetros requeridos y opcionales
7. THE Sistema SHALL documentar requisitos de autenticación para cada endpoint

### Requisito 18: Logging y Monitoreo

**User Story:** Como administrador del sistema, quiero que se registren eventos importantes, para que pueda monitorear y diagnosticar problemas.

#### Acceptance Criteria

1. THE Sistema SHALL registrar todos los errores con stack trace completo
2. THE Sistema SHALL registrar intentos de autenticación fallidos
3. THE Sistema SHALL registrar cambios en roles y permisos
4. THE Sistema SHALL nunca registrar contraseñas o tokens en logs
5. THE Sistema SHALL incluir timestamp en todos los logs
6. THE Sistema SHALL incluir nivel de log (info, warn, error)
7. WHEN ocurre un error THEN el Sistema SHALL registrar path, method y usuario si está disponible

### Requisito 19: Integridad Referencial

**User Story:** Como administrador de datos, quiero que se mantenga la integridad referencial, para que no existan referencias a registros inexistentes.

#### Acceptance Criteria

1. WHEN se intenta eliminar un registro referenciado THEN el Sistema SHALL retornar error 409
2. WHEN se intenta crear un registro con referencia inválida THEN el Sistema SHALL retornar error 400
3. THE Sistema SHALL usar eliminación lógica (soft delete) para registros principales
4. WHEN se elimina un usuario THEN el Sistema SHALL eliminar en cascada si está configurado en el schema
5. THE Sistema SHALL validar que todas las claves foráneas referencien registros existentes

### Requisito 20: Rendimiento y Optimización

**User Story:** Como usuario del sistema, quiero que las operaciones sean rápidas, para que pueda trabajar eficientemente.

#### Acceptance Criteria

1. THE Sistema SHALL usar índices en campos de búsqueda frecuente (identificacion, nombres, usuario)
2. THE Sistema SHALL usar índices en todas las claves foráneas
3. WHEN se consultan relaciones THEN el Sistema SHALL usar eager loading para evitar N+1 queries
4. WHEN se calculan estadísticas THEN el Sistema SHALL usar agregaciones de base de datos
5. THE Sistema SHALL cachear permisos de usuario en el token JWT
6. THE Sistema SHALL usar prepared statements para todas las consultas SQL
7. THE Sistema SHALL limitar el tamaño de respuestas mediante paginación obligatoria
