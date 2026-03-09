# Plan de Implementación: Backend Sistema MICASA

## Resumen

Este plan implementa un backend RESTful con Node.js, Express, TypeScript, Prisma ORM y PostgreSQL para gestionar todas las operaciones de una iglesia. El sistema incluye autenticación JWT, autorización RBAC, validación con Zod, auditoría completa y documentación Swagger.

## Tareas

- [x] 1. Configuración inicial del proyecto
  - [x] 1.1 Inicializar proyecto Node.js con TypeScript
    - Ejecutar `npm init -y` y configurar package.json con scripts
    - Instalar dependencias de producción: express, typescript, @prisma/client, bcrypt, jsonwebtoken, dotenv, cors, helmet, express-rate-limit, compression, zod, winston, swagger-ui-express, swagger-jsdoc
    - Instalar dependencias de desarrollo: @types/*, prisma, ts-node, ts-node-dev, jest, ts-jest, supertest, fast-check, eslint, prettier
    - Configurar tsconfig.json con opciones strict y paths apropiados
    - _Requisitos: Configuración Inicial del Proyecto_

  - [x] 1.2 Crear estructura de carpetas del proyecto
    - Crear directorios: src/config, src/controllers, src/routes, src/services, src/middlewares, src/validators, src/types, src/utils, tests
    - Crear archivos base: src/app.ts, src/server.ts
    - Crear .env.example con todas las variables necesarias
    - Crear .gitignore para Node.js y TypeScript
    - _Requisitos: Arquitectura del Sistema_

  - [x] 1.3 Configurar Prisma ORM con PostgreSQL
    - Ejecutar `npx prisma init`
    - Copiar el schema SQL completo a prisma/schema.prisma
    - Configurar DATABASE_URL en .env
    - Ejecutar `npx prisma generate` para generar el cliente
    - Crear src/config/database.ts con instancia de PrismaClient
    - _Requisitos: Modelos de Datos_


  - [x] 1.4 Configurar variables de entorno y constantes
    - Crear archivo .env con todas las variables (PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc.)
    - Crear src/utils/constants.ts con constantes del sistema
    - Crear src/config/jwt.ts con configuración de JWT
    - Validar que todas las variables requeridas estén presentes al iniciar
    - _Requisitos: 16.3, Variables de Entorno_

  - [x] 1.5 Configurar Express con middlewares básicos
    - Crear src/app.ts con configuración de Express
    - Configurar helmet para headers de seguridad
    - Configurar CORS con orígenes permitidos
    - Configurar express.json() y express.urlencoded()
    - Configurar compression para respuestas gzip
    - Agregar endpoint /health para health checks
    - _Requisitos: 16.4, 16.5, 16.9_

  - [x]1.6 Configurar sistema de logging con Winston
    - Crear src/utils/logger.ts con configuración de Winston
    - Configurar niveles de log (info, warn, error)
    - Configurar transports para consola y archivo
    - Incluir timestamps y formato JSON
    - _Requisitos: 18.1, 18.5, 18.6_

- [x] 2. Implementar sistema de autenticación
  - [x] 2.1 Crear tipos TypeScript para autenticación
    - Crear src/types/express.d.ts extendiendo Request con propiedad user
    - Crear src/types/auth.types.ts con interfaces JWTPayload, AuthResult, LoginDTO
    - Crear src/types/common.types.ts con tipos PaginatedResult, ApiResponse
    - _Requisitos: 1.4, Componente 1_

  - [x] 2.2 Implementar servicio de autenticación
    - Crear src/services/auth.service.ts con clase AuthService
    - Implementar método login() que valida credenciales y genera JWT
    - Implementar método verifyToken() para validar tokens
    - Implementar método refreshToken() para renovar tokens
    - Usar bcrypt.compare() para verificar contraseñas con factor de costo 10
    - Incluir userId, personaId, username, roles y permisos en payload del JWT
    - Actualizar campo ultimo_acceso al autenticar
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 4.5_


  - [ ]2.3 Escribir property test para autenticación
    - **Propiedad 8: Tokens JWT Válidos Contienen Información Completa**
    - **Propiedad 9: Contraseñas Hasheadas con Bcrypt**
    - **Propiedad 22: Actualización de Último Acceso en Login**
    - **Valida: Requisitos 1.4, 1.7, 1.5**

  - [x] 2.4 Crear controlador de autenticación
    - Crear src/controllers/auth.controller.ts con clase AuthController
    - Implementar método login() que recibe credenciales y retorna token
    - Implementar método logout() para invalidar sesión
    - Implementar método refreshToken() para renovar token
    - Implementar método getCurrentUser() para obtener info del usuario autenticado
    - Implementar método changePassword() para cambio de contraseña
    - Manejar errores 401 para credenciales inválidas sin revelar detalles
    - _Requisitos: 1.1, 1.2, 1.3, 14.2, Componente 1_

  - [x] 2.5 Crear validadores para autenticación
    - Crear src/validators/auth.validator.ts con schemas Zod
    - Crear LoginSchema validando usuario y clave no vacíos
    - Crear ChangePasswordSchema validando contraseña mínimo 8 caracteres
    - _Requisitos: 13.1, 13.2, 4.4_

  - [x] 2.6 Crear rutas de autenticación
    - Crear src/routes/auth.routes.ts con router de Express
    - Definir POST /api/auth/login con validación de LoginSchema
    - Definir POST /api/auth/logout
    - Definir POST /api/auth/refresh
    - Definir GET /api/auth/me
    - Definir PUT /api/auth/change-password
    - Agregar documentación Swagger para cada endpoint
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API_

- [x] 3. Implementar middlewares de seguridad y validación
  - [x] 3.1 Crear middleware de autenticación
    - Crear src/middlewares/auth.middleware.ts
    - Extraer token del header Authorization Bearer
    - Verificar y decodificar token JWT
    - Validar que el usuario siga activo en base de datos
    - Agregar información del usuario a req.user
    - Retornar 401 si token ausente, inválido o expirado
    - _Requisitos: 2.1, 2.2, 2.5, Flujo de Autenticación_


  - [x] 3.2 Crear middleware de autorización
    - Crear src/middlewares/authorization.middleware.ts
    - Implementar función requirePermission(permission: string) que retorna middleware
    - Verificar que req.user.permissions incluya el permiso requerido
    - Retornar 403 si el usuario no tiene el permiso
    - Incluir permiso requerido en respuesta de error para debugging
    - _Requisitos: 2.3, 2.4, 14.3, Flujo de Autorización_

  - [ ]3.3 Escribir property test para autorización
    - **Propiedad 3: Consistencia de Roles y Permisos**
    - **Propiedad 23: Filtrado de Registros Activos**
    - **Valida: Requisitos 2.4, 4.9**

  - [x] 3.4 Crear middleware de validación
    - Crear src/middlewares/validation.middleware.ts
    - Implementar función validate(schema: ZodSchema) que retorna middleware
    - Validar req.body contra el schema proporcionado
    - Retornar 400 con detalles de errores si falla validación
    - Formatear errores con campo y mensaje específico
    - _Requisitos: 13.1, 13.2, 13.3, 14.1_

  - [x] 3.5 Crear middleware de manejo de errores
    - Crear src/middlewares/error.middleware.ts
    - Implementar errorHandler que captura todos los errores
    - Manejar errores de Prisma (P2002 unicidad → 409, P2025 no encontrado → 404)
    - Manejar errores de validación → 400
    - Manejar errores de autorización → 401/403
    - Retornar 500 para errores internos sin exponer detalles técnicos
    - Registrar todos los errores en logs con stack trace
    - _Requisitos: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

  - [x] 3.6 Configurar rate limiting
    - Implementar rate limiting general de 100 requests/minuto por IP
    - Implementar rate limiting específico para login de 5 intentos/minuto por IP
    - Usar express-rate-limit middleware
    - _Requisitos: 16.1, 16.2_

- [x] 4. Checkpoint - Verificar configuración base
  - Asegurar que el servidor inicie correctamente
  - Verificar que /health retorne 200
  - Verificar que login funcione y genere token válido
  - Verificar que middlewares de autenticación y autorización funcionen
  - Preguntar al usuario si hay dudas o ajustes necesarios


- [x] 5. Implementar módulo de Personas
  - [x] 5.1 Crear validadores para Personas
    - Crear src/validators/personas.validator.ts
    - Crear CreatePersonaSchema con validaciones de todos los campos
    - Validar primer_nombre y primer_apellido obligatorios (max 50 chars)
    - Validar genero como enum ['M', 'F']
    - Validar tipo_identificacion como enum ['CC', 'TI', 'CE', 'PAS', 'RC']
    - Validar estado_civil como enum ['S', 'C', 'V', 'D', 'U']
    - Validar email con formato válido
    - Validar que fecha_bautizo sea posterior a fecha_nacimiento si bautizado es true
    - Crear UpdatePersonaSchema como partial de CreatePersonaSchema
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 5.2 Implementar servicio de Personas
    - Crear src/services/personas.service.ts con clase PersonasService
    - Implementar getAll() con paginación (page, limit, filtros)
    - Implementar getById() para obtener persona por ID
    - Implementar getByIdentificacion() para buscar por identificación única
    - Implementar search() para búsqueda por nombre
    - Implementar create() validando unicidad de identificación
    - Implementar update() validando datos y registrando auditoría
    - Implementar delete() como soft delete (estado = false)
    - Registrar todas las operaciones en auditoría (INSERT, UPDATE, DELETE)
    - _Requisitos: 3.1, 3.2, 3.3, 3.8, 3.9, 3.10, Componente 2_

  - [ ]5.3 Escribir property tests para Personas
    - **Propiedad 1: Unicidad de Identificación de Personas**
    - **Propiedad 2: Integridad de Fechas de Bautizo**
    - **Propiedad 10: Eliminación Lógica de Registros Principales**
    - **Valida: Requisitos 3.2, 3.3, 3.8**

  - [x] 5.4 Crear controlador de Personas
    - Crear src/controllers/personas.controller.ts con clase PersonasController
    - Implementar getAll() con paginación desde query params
    - Implementar getById() retornando 404 si no existe
    - Implementar getByIdentificacion() para búsqueda por identificación
    - Implementar search() para búsqueda por nombre
    - Implementar create() retornando 201 con persona creada
    - Implementar update() retornando 200 con persona actualizada
    - Implementar delete() retornando 200 con mensaje de éxito
    - Pasar userId desde req.user a los servicios para auditoría
    - _Requisitos: 3.1, 3.8, 3.9, 3.10, Componente 2_


  - [x] 5.5 Crear rutas de Personas
    - Crear src/routes/personas.routes.ts
    - Definir GET /api/personas con authMiddleware y requirePermission('PERSONAS_READ')
    - Definir GET /api/personas/:id con permisos PERSONAS_READ
    - Definir GET /api/personas/identificacion/:id con permisos PERSONAS_READ
    - Definir GET /api/personas/search con permisos PERSONAS_READ
    - Definir POST /api/personas con permisos PERSONAS_CREATE y validación
    - Definir PUT /api/personas/:id con permisos PERSONAS_UPDATE y validación
    - Definir DELETE /api/personas/:id con permisos PERSONAS_DELETE
    - Agregar documentación Swagger completa para cada endpoint
    - _Requisitos: 17.1, 17.2, 17.3, 17.6, Estructura de Endpoints API_

  - [ ]5.6 Escribir tests unitarios para servicio de Personas
    - Test crear persona con datos válidos
    - Test rechazar persona con identificación duplicada
    - Test rechazar persona con fecha_bautizo anterior a fecha_nacimiento
    - Test actualizar persona existente
    - Test soft delete de persona
    - Test búsqueda por identificación
    - Test búsqueda por nombre

- [x] 6. Implementar módulo de Usuarios
  - [x] 6.1 Crear validadores para Usuarios
    - Crear src/validators/usuarios.validator.ts
    - Crear CreateUsuarioSchema validando id_persona, usuario (min 4 chars), clave (min 8 chars)
    - Crear UpdateUsuarioSchema como partial excluyendo clave
    - Crear AssignRoleSchema validando id_rol
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.2 Implementar servicio de Usuarios
    - Crear src/services/usuarios.service.ts con clase UsuariosService
    - Implementar getAll() con paginación
    - Implementar getById() incluyendo persona relacionada
    - Implementar create() hasheando contraseña con bcrypt (factor 10), validando unicidad de usuario e id_persona
    - Implementar update() sin permitir cambio de contraseña (usar endpoint específico)
    - Implementar delete() como soft delete
    - Implementar assignRole() reactivando si existía previamente
    - Implementar removeRole() desactivando la relación
    - Implementar getUserRoles() retornando solo roles activos
    - Implementar getUserPermissions() retornando unión de permisos sin duplicados
    - Nunca retornar el hash de contraseña en respuestas
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, Componente 3_


  - [ ]6.3 Escribir property tests para Usuarios
    - **Propiedad 5: Unicidad de Usuario por Persona**
    - **Propiedad 13: Unicidad de Nombres de Usuarios**
    - **Propiedad 21: Respuestas de API sin Contraseñas**
    - **Propiedad 24: Validación de Longitud Mínima de Credenciales**
    - **Valida: Requisitos 4.2, 4.1, 4.6, 4.3, 4.4**

  - [x] 6.4 Crear controlador de Usuarios
    - Crear src/controllers/usuarios.controller.ts con clase UsuariosController
    - Implementar getAll(), getById(), create(), update(), delete()
    - Implementar assignRole() para asignar rol a usuario
    - Implementar removeRole() para remover rol de usuario
    - Implementar getUserRoles() para obtener roles del usuario
    - Implementar getUserPermissions() para obtener permisos del usuario
    - Excluir campo clave de todas las respuestas
    - _Requisitos: 4.1, 4.6, 4.7, 4.8, 4.9, Componente 3_

  - [x] 6.5 Crear rutas de Usuarios
    - Crear src/routes/usuarios.routes.ts
    - Definir GET /api/usuarios con permisos USUARIOS_READ
    - Definir GET /api/usuarios/:id con permisos USUARIOS_READ
    - Definir POST /api/usuarios con permisos USUARIOS_CREATE y validación
    - Definir PUT /api/usuarios/:id con permisos USUARIOS_UPDATE y validación
    - Definir DELETE /api/usuarios/:id con permisos USUARIOS_DELETE
    - Definir POST /api/usuarios/:id/roles con permisos USUARIOS_ASSIGN_ROLE
    - Definir DELETE /api/usuarios/:id/roles/:roleId con permisos USUARIOS_REMOVE_ROLE
    - Definir GET /api/usuarios/:id/roles con permisos USUARIOS_READ
    - Definir GET /api/usuarios/:id/permisos con permisos USUARIOS_READ
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API_

- [x] 7. Implementar módulo de Roles y Permisos
  - [x] 7.1 Crear validadores para Roles y Permisos
    - Crear src/validators/roles.validator.ts con CreateRolSchema y UpdateRolSchema
    - Crear src/validators/permisos.validator.ts con CreatePermisoSchema
    - Validar nombre único y obligatorio para roles
    - Validar nombre y módulo obligatorios para permisos
    - Validar formato MODULO_ACCION para nombres de permisos
    - _Requisitos: 5.1, 5.2, 5.3, 5.6_


  - [x] 7.2 Implementar servicios de Roles y Permisos
    - Crear src/services/roles.service.ts con CRUD completo
    - Crear src/services/permisos.service.ts con CRUD completo
    - Implementar assignPermission() en roles.service validando que ambos estén activos
    - Implementar removePermission() desactivando la relación
    - Implementar getRolePermissions() retornando solo permisos activos
    - Implementar getByModule() en permisos.service filtrando por módulo
    - Registrar operaciones en auditoría
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, Componente 4_

  - [ ]7.3 Escribir property tests para Roles y Permisos
    - **Propiedad 14: Unicidad de Nombres de Roles**
    - **Propiedad 15: Unicidad de Nombres de Permisos**
    - **Propiedad 16: Formato de Nombres de Permisos**
    - **Valida: Requisitos 5.1, 5.2, 5.6**

  - [x] 7.4 Crear controladores de Roles y Permisos
    - Crear src/controllers/roles.controller.ts con RolesController
    - Crear src/controllers/permisos.controller.ts con PermisosController
    - Implementar CRUD completo en ambos controladores
    - Implementar assignPermission() y removePermission() en RolesController
    - Implementar getRolePermissions() en RolesController
    - Implementar getByModule() en PermisosController
    - _Requisitos: 5.1, 5.2, 5.4, 5.5, Componente 4_

  - [x] 7.5 Crear rutas de Roles y Permisos
    - Crear src/routes/roles.routes.ts con endpoints CRUD
    - Crear src/routes/permisos.routes.ts con endpoints CRUD
    - Definir POST /api/roles/:id/permisos para asignar permiso
    - Definir DELETE /api/roles/:id/permisos/:permisoId para remover permiso
    - Definir GET /api/roles/:id/permisos para obtener permisos del rol
    - Definir GET /api/permisos/modulo/:modulo para filtrar por módulo
    - Aplicar permisos apropiados (ROLES_*, PERMISOS_*)
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API_

- [x] 8. Implementar sistema de Auditoría
  - [x] 8.1 Implementar servicio de Auditoría
    - Crear src/services/auditoria.service.ts con clase AuditoriaService
    - Implementar log() para registrar cambios (tabla, id_registro, accion, datos_anteriores, datos_nuevos, id_usuario)
    - Implementar getAll() con paginación
    - Implementar getByTable() filtrando por tabla
    - Implementar getByUser() filtrando por usuario
    - Implementar getByDateRange() filtrando por rango de fechas
    - Implementar getByRecord() para historial de un registro específico
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_


  - [ ]8.2 Escribir property test para Auditoría
    - **Propiedad 4: Auditoría Completa de Operaciones**
    - **Valida: Requisitos 12.1, 12.2, 12.3**

  - [x] 8.3 Crear controlador de Auditoría
    - Crear src/controllers/auditoria.controller.ts con AuditoriaController
    - Implementar getAll() con paginación
    - Implementar getByTable() para filtrar por tabla
    - Implementar getByUser() para filtrar por usuario
    - Implementar getByDateRange() para filtrar por fechas
    - Implementar getByRecord() para historial de un registro
    - _Requisitos: 12.6, 12.7, 12.8, 12.9, Componente 9_

  - [x] 8.4 Crear rutas de Auditoría
    - Crear src/routes/auditoria.routes.ts
    - Definir GET /api/auditoria con permisos AUDITORIA_READ
    - Definir GET /api/auditoria/tabla/:tabla con permisos AUDITORIA_READ
    - Definir GET /api/auditoria/usuario/:userId con permisos AUDITORIA_READ
    - Definir GET /api/auditoria/fecha con permisos AUDITORIA_READ
    - Definir GET /api/auditoria/registro/:tabla/:id con permisos AUDITORIA_READ
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API_

- [x] 9. Checkpoint - Verificar módulos core
  - Verificar que CRUD de Personas funcione correctamente
  - Verificar que CRUD de Usuarios funcione con hash de contraseñas
  - Verificar que asignación de roles y permisos funcione
  - Verificar que auditoría registre todas las operaciones
  - Verificar que paginación funcione en todos los endpoints
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 10. Implementar módulo de Ministerios
  - [x] 10.1 Crear validadores para Ministerios
    - Crear src/validators/ministerios.validator.ts
    - Crear CreateMinisterioSchema validando nombre obligatorio y único
    - Crear UpdateMinisterioSchema como partial
    - Crear AssignMemberSchema validando id_persona y cargo opcional
    - _Requisitos: 6.1, 6.2, 6.3_

  - [x] 10.2 Implementar servicio de Ministerios
    - Crear src/services/ministerios.service.ts con MinisteriosService
    - Implementar CRUD completo con paginación
    - Implementar assignPerson() para agregar miembro con cargo
    - Implementar removePerson() para desactivar miembro
    - Implementar getMembers() retornando solo miembros activos
    - Implementar updateMemberCargo() para actualizar cargo de miembro
    - Validar que lider_id referencie persona existente
    - Registrar operaciones en auditoría
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, Componente 5_


  - [x] 10.3 Crear controlador y rutas de Ministerios
    - Crear src/controllers/ministerios.controller.ts con MinisteriosController
    - Crear src/routes/ministerios.routes.ts
    - Implementar endpoints CRUD con permisos MINISTERIOS_*
    - Definir POST /api/ministerios/:id/miembros para asignar persona
    - Definir DELETE /api/ministerios/:id/miembros/:personaId para remover
    - Definir GET /api/ministerios/:id/miembros para obtener miembros
    - Definir PUT /api/ministerios/:id/miembros/:personaId para actualizar cargo
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API, Componente 5_

- [x] 11. Implementar módulo de Familias
  - [x] 11.1 Crear validadores para Familias
    - Crear src/validators/familias.validator.ts
    - Crear CreateFamiliaSchema validando nombre obligatorio
    - Crear AddMemberSchema validando id_persona, parentesco y es_cabeza_familia
    - Validar parentesco como enum ['PADRE', 'MADRE', 'HIJO', 'HIJA', 'ESPOSO', 'ESPOSA', 'ABUELO', 'ABUELA', 'NIETO', 'NIETA', 'OTRO']
    - _Requisitos: 7.1, 7.2, 7.3_

  - [x] 11.2 Implementar servicio de Familias
    - Crear src/services/familias.service.ts con FamiliasService
    - Implementar CRUD completo con paginación
    - Implementar addMember() validando que solo haya una cabeza de familia
    - Implementar removeMember() para desactivar miembro
    - Implementar getMembers() incluyendo información de parentesco
    - Implementar updateMemberParentesco() para actualizar parentesco
    - Validar que toda familia tenga exactamente una cabeza de familia
    - Registrar operaciones en auditoría
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, Componente 6_

  - [ ]11.3 Escribir property test para Familias
    - **Propiedad 7: Cabeza de Familia Única**
    - **Valida: Requisitos 7.4, 7.5**

  - [x] 11.4 Crear controlador y rutas de Familias
    - Crear src/controllers/familias.controller.ts con FamiliasController
    - Crear src/routes/familias.routes.ts
    - Implementar endpoints CRUD con permisos FAMILIAS_*
    - Definir POST /api/familias/:id/miembros para agregar miembro
    - Definir DELETE /api/familias/:id/miembros/:personaId para remover
    - Definir GET /api/familias/:id/miembros para obtener miembros
    - Definir PUT /api/familias/:id/miembros/:personaId para actualizar parentesco
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API, Componente 6_


- [x] 12. Implementar módulo de Contactos
  - [x] 12.1 Crear validadores para Contactos
    - Crear src/validators/contactos.validator.ts
    - Crear CreateContactoSchema validando tipo_contacto y valor
    - Validar tipo_contacto como enum ['TELEFONO', 'EMAIL', 'WHATSAPP', 'OTRO']
    - Validar formato de email cuando tipo_contacto es EMAIL
    - _Requisitos: 8.1, 8.2, 8.3_

  - [x] 12.2 Implementar servicio de Contactos
    - Crear src/services/contactos.service.ts con ContactosService
    - Implementar getByPersona() para obtener contactos de una persona
    - Implementar getById() para obtener contacto específico
    - Implementar create() validando formato según tipo
    - Implementar update() validando datos
    - Implementar delete() como soft delete
    - Implementar setPrincipal() validando que sea único por tipo y persona
    - Retornar solo contactos activos en consultas
    - Registrar operaciones en auditoría
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, Componente 7_

  - [ ]12.3 Escribir property test para Contactos
    - **Propiedad 18: Contacto Principal Único por Tipo**
    - **Valida: Requisitos 8.4**

  - [x] 12.4 Crear controlador y rutas de Contactos
    - Crear src/controllers/contactos.controller.ts con ContactosController
    - Crear src/routes/contactos.routes.ts
    - Definir GET /api/contactos/persona/:personaId con permisos CONTACTOS_READ
    - Definir GET /api/contactos/:id con permisos CONTACTOS_READ
    - Definir POST /api/contactos con permisos CONTACTOS_CREATE y validación
    - Definir PUT /api/contactos/:id con permisos CONTACTOS_UPDATE y validación
    - Definir DELETE /api/contactos/:id con permisos CONTACTOS_DELETE
    - Definir PUT /api/contactos/:id/principal con permisos CONTACTOS_UPDATE
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API, Componente 7_

- [x] 13. Implementar módulo de Eventos y Asistencias
  - [x] 13.1 Crear validadores para Eventos
    - Crear src/validators/eventos.validator.ts
    - Crear CreateEventoSchema validando nombre y fecha_inicio obligatorios
    - Validar tipo_evento como enum ['CULTO', 'REUNION', 'CONFERENCIA', 'RETIRO', 'SERVICIO', 'OTRO']
    - Validar que fecha_fin sea posterior o igual a fecha_inicio
    - Crear RegisterAttendanceSchema validando array de asistencias
    - _Requisitos: 9.1, 9.2, 9.3, 10.1_


  - [x] 13.2 Implementar servicio de Eventos
    - Crear src/services/eventos.service.ts con EventosService
    - Implementar CRUD completo con paginación
    - Implementar getByDateRange() filtrando por rango de fechas
    - Implementar getByMinisterio() filtrando por ministerio
    - Validar que id_ministerio referencie ministerio existente
    - Implementar delete() como soft delete
    - Registrar operaciones en auditoría
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, Componente 8_

  - [x] 13.3 Implementar servicio de Asistencias
    - Crear src/services/asistencias.service.ts con AsistenciasService
    - Implementar registerAttendance() validando evento y personas existen
    - Actualizar registro si ya existe, crear si no existe
    - Validar unicidad de combinación id_evento + id_persona
    - Implementar getAttendance() para obtener asistencias de un evento
    - Implementar getAttendanceStats() calculando total, asistieron y porcentaje
    - Permitir filtros por ministerio y rango de fechas en estadísticas
    - Usar agregaciones de base de datos para cálculos
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 11.1, 11.2, 11.3, 11.4, 11.5, Componente 8_

  - [ ]13.4 Escribir property tests para Eventos y Asistencias
    - **Propiedad 6: Integridad de Fechas de Eventos**
    - **Propiedad 17: Unicidad de Asistencia por Evento y Persona**
    - **Propiedad 25: Cálculo Correcto de Estadísticas de Asistencia**
    - **Valida: Requisitos 9.2, 10.4, 11.1, 11.2**

  - [x] 13.5 Crear controladores de Eventos y Asistencias
    - Crear src/controllers/eventos.controller.ts con EventosController
    - Implementar CRUD completo
    - Implementar getByDateRange() con query params start y end
    - Implementar getByMinisterio() con param ministerioId
    - Implementar registerAttendance() recibiendo array de asistencias
    - Implementar getAttendance() retornando asistencias con info de persona
    - Implementar getAttendanceStats() retornando estadísticas calculadas
    - _Requisitos: 9.1, 9.5, 9.6, 10.1, 10.7, 11.1, Componente 8_

  - [x] 13.6 Crear rutas de Eventos
    - Crear src/routes/eventos.routes.ts
    - Definir endpoints CRUD con permisos EVENTOS_*
    - Definir GET /api/eventos/fecha con permisos EVENTOS_READ
    - Definir GET /api/eventos/ministerio/:id con permisos EVENTOS_READ
    - Definir POST /api/eventos/:id/asistencia con permisos EVENTOS_REGISTER_ATTENDANCE
    - Definir GET /api/eventos/:id/asistencia con permisos EVENTOS_READ
    - Definir GET /api/eventos/:id/estadisticas con permisos EVENTOS_READ
    - Agregar documentación Swagger completa
    - _Requisitos: 17.1, 17.2, Estructura de Endpoints API, Componente 8_


- [x] 14. Checkpoint - Verificar módulos de gestión
  - Verificar que CRUD de Ministerios funcione correctamente
  - Verificar que gestión de Familias funcione con validación de cabeza única
  - Verificar que Contactos valide formatos según tipo
  - Verificar que Eventos y Asistencias funcionen con estadísticas correctas
  - Verificar que todas las operaciones se registren en auditoría
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [ ] 15. Implementar utilidades y helpers
  - [x] 15.1 Crear utilidad de respuestas estandarizadas
    - Crear src/utils/response.ts con funciones helper
    - Implementar successResponse() para respuestas exitosas
    - Implementar errorResponse() para respuestas de error
    - Implementar paginatedResponse() para respuestas con paginación
    - Estandarizar formato: {success, data?, error?, metadata?}
    - _Requisitos: 14.1, 15.5_

  - [x] 15.2 Implementar función de paginación reutilizable
    - Crear src/utils/pagination.ts con función paginateResults()
    - Validar que page >= 1 y limit entre 1 y 100
    - Calcular skip, total, totalPages, hasNextPage, hasPrevPage
    - Retornar data y metadata consistentes
    - _Requisitos: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ]15.3 Escribir property tests para paginación
    - **Propiedad 11: Paginación con Límite Máximo**
    - **Propiedad 12: Metadata de Paginación Consistente**
    - **Valida: Requisitos 15.4, 15.5, 15.6**

- [ ] 16. Configurar documentación Swagger completa
  - [x] 16.1 Configurar Swagger con OpenAPI 3.0
    - Crear src/config/swagger.ts con configuración completa
    - Definir info, servers, components.securitySchemes
    - Configurar bearerAuth para JWT
    - Implementar setupSwagger() para montar en /api-docs
    - _Requisitos: 17.1, 17.2_

  - [x] 16.2 Documentar todos los endpoints con JSDoc
    - Agregar comentarios @swagger en todas las rutas
    - Documentar parámetros, request body, responses
    - Documentar códigos de respuesta (200, 201, 400, 401, 403, 404, 409, 500)
    - Documentar esquemas de datos con ejemplos
    - Documentar requisitos de autenticación por endpoint
    - _Requisitos: 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_


- [ ] 17. Integrar todas las rutas en el router principal
  - [x] 17.1 Crear router principal
    - Crear src/routes/index.ts que importe todas las rutas
    - Montar rutas de auth en /auth
    - Montar rutas de personas en /personas
    - Montar rutas de usuarios en /usuarios
    - Montar rutas de roles en /roles
    - Montar rutas de permisos en /permisos
    - Montar rutas de ministerios en /ministerios
    - Montar rutas de familias en /familias
    - Montar rutas de contactos en /contactos
    - Montar rutas de eventos en /eventos
    - Montar rutas de auditoría en /auditoria
    - Exportar router principal para usar en app.ts
    - _Requisitos: Estructura de Endpoints API_

  - [x] 17.2 Integrar router en app.ts
    - Importar router principal en src/app.ts
    - Montar router en /api (o según API_PREFIX en .env)
    - Asegurar que errorHandler sea el último middleware
    - _Requisitos: Configuración de Express_

- [x] 18. Implementar seeds de datos iniciales
  - [x] 18.1 Crear script de seed para datos base
    - Crear prisma/seed.ts con datos iniciales
    - Crear permisos base para todos los módulos (MODULO_CREATE, MODULO_READ, MODULO_UPDATE, MODULO_DELETE)
    - Crear rol de Administrador con todos los permisos
    - Crear persona y usuario administrador inicial
    - Asignar rol de Administrador al usuario inicial
    - Configurar script en package.json: "prisma:seed"
    - _Requisitos: 5.6, Sistema de Roles y Permisos_

  - [ ]18.2 Escribir tests de integración para seeds
    - Test verificar que permisos base se crean correctamente
    - Test verificar que rol Administrador tiene todos los permisos
    - Test verificar que usuario admin puede autenticarse

- [~] 19. Checkpoint - Verificar integración completa
  - Verificar que todas las rutas estén montadas correctamente
  - Verificar que Swagger muestre todos los endpoints
  - Verificar que seeds creen datos iniciales correctamente
  - Verificar que usuario admin pueda autenticarse y acceder a todos los recursos
  - Preguntar al usuario si hay dudas o ajustes necesarios


- [ ] 20. Implementar tests de integración end-to-end
  - [ ]20.1 Configurar entorno de testing
    - Configurar Jest con ts-jest
    - Crear jest.config.js con configuración para TypeScript
    - Configurar base de datos de prueba separada
    - Crear setup y teardown para tests
    - _Requisitos: Estrategia de Testing_

  - [ ]20.2 Escribir tests de integración para flujo de autenticación
    - Test flujo completo: crear persona → crear usuario → login → acceder a recurso protegido
    - Test login con credenciales inválidas retorna 401
    - Test acceso sin token retorna 401
    - Test acceso con token expirado retorna 401
    - Test acceso sin permisos retorna 403
    - _Requisitos: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

  - [ ]20.3 Escribir tests de integración para módulo de Personas
    - Test crear persona con datos válidos retorna 201
    - Test crear persona con identificación duplicada retorna 409
    - Test actualizar persona retorna 200 y registra auditoría
    - Test eliminar persona hace soft delete
    - Test buscar persona por identificación
    - Test paginación funciona correctamente
    - _Requisitos: 3.1, 3.2, 3.8, 3.9_

  - [ ]20.4 Escribir tests de integración para roles y permisos
    - Test asignar rol a usuario
    - Test obtener permisos de usuario incluye todos los permisos de sus roles
    - Test usuario con permiso puede acceder a recurso
    - Test usuario sin permiso recibe 403
    - _Requisitos: 2.4, 4.7, 4.9_

  - [ ]20.5 Escribir tests de integración para eventos y asistencias
    - Test crear evento y registrar asistencias múltiples
    - Test actualizar asistencia existente
    - Test estadísticas calculan correctamente total y porcentaje
    - Test filtrar eventos por rango de fechas
    - _Requisitos: 9.1, 10.1, 10.3, 11.1, 11.2_

  - [ ]20.6 Escribir tests de integración para auditoría
    - Test toda operación CREATE genera registro de auditoría con acción INSERT
    - Test toda operación UPDATE genera registro con datos anteriores y nuevos
    - Test toda operación DELETE genera registro con datos anteriores
    - Test consultar historial de un registro retorna todos los cambios
    - _Requisitos: 12.1, 12.2, 12.3, 12.9_


- [ ] 21. Optimización y mejoras de rendimiento
  - [x] 21.1 Optimizar consultas de base de datos
    - Revisar que todos los índices del schema SQL estén definidos en Prisma
    - Agregar índices en campos de búsqueda frecuente (identificacion, nombres, usuario)
    - Agregar índices en todas las claves foráneas
    - Usar eager loading con include para evitar N+1 queries
    - _Requisitos: 20.1, 20.2, 20.3_

  - [x] 21.2 Implementar caché de permisos en JWT
    - Verificar que permisos estén incluidos en payload del JWT
    - Evitar consultar permisos en cada request usando datos del token
    - Documentar que cambios en permisos requieren nuevo login
    - _Requisitos: 20.5_

  - [x] 21.3 Optimizar estadísticas con agregaciones SQL
    - Verificar que getAttendanceStats() use agregaciones de Prisma
    - Usar count(), sum() y avg() en lugar de traer datos a memoria
    - _Requisitos: 11.5, 20.4_

  - [ ]21.4 Realizar pruebas de carga
    - Usar herramienta como Artillery o k6
    - Probar endpoints más usados con carga concurrente
    - Identificar cuellos de botella
    - Documentar resultados y optimizaciones aplicadas

- [ ] 22. Documentación final y README
  - [x] 22.1 Crear README.md completo
    - Descripción del proyecto y características principales
    - Requisitos previos (Node.js, PostgreSQL)
    - Instrucciones de instalación paso a paso
    - Configuración de variables de entorno
    - Comandos para ejecutar migraciones y seeds
    - Comandos para ejecutar en desarrollo y producción
    - Comandos para ejecutar tests
    - Enlace a documentación Swagger
    - Estructura del proyecto explicada
    - _Requisitos: Documentación_

  - [x] 22.2 Documentar arquitectura y decisiones técnicas
    - Crear docs/ARCHITECTURE.md explicando capas del sistema
    - Documentar flujos principales (autenticación, autorización, auditoría)
    - Documentar decisiones de diseño (soft delete, paginación, etc.)
    - Crear diagramas de flujo si es necesario
    - _Requisitos: Arquitectura del Sistema_


  - [x] 22.3 Crear guía de contribución
    - Crear CONTRIBUTING.md con guías de estilo
    - Documentar proceso de pull requests
    - Documentar convenciones de código (ESLint, Prettier)
    - Documentar convenciones de commits
    - Documentar cómo ejecutar tests antes de commit
    - _Requisitos: Mejores Prácticas_

  - [x] 22.4 Crear documentación de API adicional
    - Documentar ejemplos de uso de cada endpoint
    - Crear colección de Postman o archivo de requests
    - Documentar códigos de error comunes y soluciones
    - Documentar límites de rate limiting
    - _Requisitos: 17.1, 17.2, 16.1, 16.2_

- [ ] 23. Configuración de seguridad adicional
  - [x] 23.1 Revisar y fortalecer configuración de seguridad
    - Verificar que helmet esté configurado con todas las opciones
    - Verificar que CORS no use wildcard en producción
    - Verificar que rate limiting esté activo
    - Verificar que todas las contraseñas usen bcrypt con factor >= 10
    - Verificar que JWT_SECRET sea fuerte en producción
    - _Requisitos: 16.4, 16.5, 16.6, 16.1, 16.2, 1.7_

  - [x] 23.2 Implementar logging de eventos de seguridad
    - Registrar intentos de login fallidos con IP
    - Registrar accesos denegados por falta de permisos
    - Registrar cambios en roles y permisos
    - Nunca registrar contraseñas o tokens en logs
    - _Requisitos: 16.7, 16.8, 18.2, 18.3, 18.4_

  - [x] 23.3 Validar integridad referencial
    - Verificar que todas las claves foráneas tengan validación
    - Verificar que intentos de eliminar registros referenciados retornen 409
    - Verificar que soft delete funcione para entidades principales
    - _Requisitos: 19.1, 19.2, 19.3, 19.4, 19.5_

- [~] 24. Checkpoint final - Verificación completa del sistema
  - Ejecutar todos los tests y verificar que pasen
  - Verificar que cobertura de tests sea >= 80%
  - Verificar que Swagger documente todos los endpoints
  - Verificar que README tenga instrucciones completas
  - Verificar que seeds creen datos iniciales correctamente
  - Verificar que todas las medidas de seguridad estén implementadas
  - Realizar prueba end-to-end completa del sistema
  - Preguntar al usuario si hay ajustes finales necesarios


## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que valida para trazabilidad
- Los checkpoints permiten validación incremental y ajustes tempranos
- Los property tests validan propiedades universales del sistema
- Los tests de integración validan flujos completos end-to-end
- La implementación sigue arquitectura en capas: Routes → Controllers → Services → Prisma → DB
- Todas las operaciones de modificación deben registrarse en auditoría
- Todas las listas deben estar paginadas con límite máximo de 100 registros
- Todos los endpoints protegidos requieren autenticación y autorización
- El sistema usa soft delete (estado = false) para entidades principales
- Las contraseñas siempre se hashean con bcrypt (factor >= 10)
- Los tokens JWT incluyen roles y permisos para evitar consultas adicionales
- La documentación Swagger debe estar completa y actualizada
- El código debe seguir convenciones de TypeScript con tipos estrictos

## Orden de Implementación Recomendado

1. **Fase 1 - Base (Tareas 1-4)**: Configuración inicial, autenticación, middlewares
2. **Fase 2 - Core (Tareas 5-9)**: Personas, Usuarios, Roles, Permisos, Auditoría
3. **Fase 3 - Gestión (Tareas 10-14)**: Ministerios, Familias, Contactos, Eventos
4. **Fase 4 - Integración (Tareas 15-19)**: Utilidades, Swagger, Seeds, Integración
5. **Fase 5 - Testing (Tarea 20)**: Tests de integración end-to-end
6. **Fase 6 - Finalización (Tareas 21-24)**: Optimización, Documentación, Seguridad

## Estimación de Tiempo

- Fase 1: 3-5 días
- Fase 2: 5-7 días
- Fase 3: 5-7 días
- Fase 4: 3-4 días
- Fase 5: 2-3 días (opcional)
- Fase 6: 2-3 días

**Total estimado**: 20-29 días de desarrollo (sin tests opcionales: 18-26 días)

