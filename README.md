# Backend Sistema de Gestión de Iglesia MICASA

API RESTful construida con Node.js, Express, TypeScript y Prisma ORM para la gestión integral de una iglesia. Sistema completo para administrar personas, usuarios, roles, permisos, ministerios, familias, contactos, eventos y asistencias.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Migraciones y Seeds](#-migraciones-y-seeds)
- [Ejecución](#-ejecución)
- [Testing](#-testing)
- [Documentación API](#-documentación-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Seguridad](#-seguridad)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación Adicional](#-documentación-adicional)

## ✨ Características Principales

- ✅ **Autenticación JWT** - Tokens con expiración de 8 horas y refresh tokens
- ✅ **Autorización RBAC** - Control de acceso basado en roles y permisos
- ✅ **Validación Robusta** - Validación de datos con Zod en todas las entradas
- ✅ **Auditoría Completa** - Registro histórico de todos los cambios (INSERT, UPDATE, DELETE)
- ✅ **Paginación** - Resultados paginados en todas las listas con metadata
- ✅ **Soft Delete** - Eliminación lógica para entidades principales
- ✅ **Rate Limiting** - Protección contra abuso (100 req/min general, 5 login/min)
- ✅ **Logging** - Sistema de logs con Winston (consola y archivo)
- ✅ **Documentación Swagger** - API completamente documentada con OpenAPI 3.0
- ✅ **Seguridad** - Helmet, CORS, bcrypt, validación de datos
- ✅ **TypeScript** - Tipado estático completo
- ✅ **Prisma ORM** - Acceso a base de datos type-safe

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Descargar](https://www.postgresql.org/download/))
- **npm** o **yarn** (incluido con Node.js)

Verifica las versiones instaladas:

```bash
node --version
npm --version
psql --version
```

## 🚀 Instalación

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd micasa-backend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- **Producción**: express, prisma, bcrypt, jsonwebtoken, zod, winston, swagger, helmet, cors
- **Desarrollo**: typescript, jest, eslint, prettier, supertest, fast-check

### Paso 3: Configurar PostgreSQL

Crea una base de datos en PostgreSQL:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE micasa;

# Crear usuario (opcional)
CREATE USER micasa_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE micasa TO micasa_user;

# Salir
\q
```

## ⚙️ Configuración

### Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database - IMPORTANTE: Actualiza con tus credenciales
DATABASE_URL=postgresql://usuario:password@localhost:5432/micasa

# JWT - IMPORTANTE: Cambia estos secretos en producción
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS - Actualiza con tu frontend URL
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
```

### Configuración Importante

- **DATABASE_URL**: Actualiza con tus credenciales de PostgreSQL
- **JWT_SECRET**: Usa un secreto fuerte en producción (mínimo 32 caracteres)
- **CORS_ORIGIN**: Configura el origen de tu aplicación frontend
- **NODE_ENV**: Usa `production` en entornos de producción

## 🗄️ Migraciones y Seeds

### Generar Cliente de Prisma

```bash
npm run prisma:generate
```

Este comando genera el cliente de Prisma basado en el schema.

### Ejecutar Migraciones

```bash
npm run prisma:migrate
```

Esto creará todas las tablas en la base de datos:
- personas
- usuarios
- roles
- permisos
- ministerios
- familias
- contactos
- eventos
- asistencias_eventos
- auditoria
- Tablas de relación (usuarios_roles, roles_permisos, etc.)

### Ejecutar Seeds (Opcional)

```bash
npm run prisma:seed
```

Esto poblará la base de datos con datos iniciales:
- Roles predefinidos (Administrador, Pastor, Líder, Miembro)
- Permisos por módulo
- Usuario administrador por defecto

### Prisma Studio (Opcional)

Para explorar y editar datos visualmente:

```bash
npm run prisma:studio
```

Abre http://localhost:5555 en tu navegador.

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en http://localhost:3000 con hot-reload automático.

### Modo Producción

```bash
# 1. Compilar TypeScript
npm run build

# 2. Iniciar servidor
npm start
```

### Verificar que el servidor está funcionando

```bash
# Health check
curl http://localhost:3000/health

# Debería retornar: {"status":"ok"}
```

## 🧪 Testing

El proyecto incluye tests unitarios y property-based tests con Jest y fast-check.

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura de código
npm test -- --coverage

# Ejecutar tests específicos
npm test -- personas.test.ts
```

Los tests cubren:
- Servicios de negocio
- Validadores
- Utilidades (paginación, respuestas)
- Property-based tests para invariantes del sistema

## 📚 Documentación API

### 📖 Índice de Documentación Completa

Para una guía completa de la API, consulta:

**[📘 Índice de Documentación de la API](./docs/API_DOCUMENTATION_INDEX.md)**

Esta guía incluye:
- **[Ejemplos de Uso](./docs/API_USAGE_EXAMPLES.md)** - Ejemplos prácticos con cURL para cada endpoint
- **[Códigos de Error](./docs/API_ERROR_CODES.md)** - Guía completa de errores y soluciones
- **[Rate Limiting](./docs/API_RATE_LIMITING.md)** - Límites y mejores prácticas
- **[Colección Postman](./postman_collection.json)** - Importar en Postman
- **[Archivo HTTP](./api-requests.http)** - Para VS Code REST Client

### Swagger UI (Documentación Interactiva)

Una vez iniciado el servidor, accede a la documentación interactiva:

```
http://localhost:3000/api-docs
```

La documentación Swagger incluye:
- Todos los endpoints disponibles
- Esquemas de request y response
- Códigos de respuesta HTTP
- Autenticación requerida
- Ejemplos de uso
- Posibilidad de probar endpoints directamente

### Autenticación en Swagger

1. Haz login en `POST /api/auth/login`
2. Copia el token de la respuesta
3. Haz clic en "Authorize" en la parte superior
4. Ingresa: `Bearer <tu-token>`
5. Ahora puedes probar endpoints protegidos

### Inicio Rápido

```bash
# 1. Login y obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","clave":"Admin123!"}'

# 2. Usar el token en requests
curl -X GET http://localhost:3000/api/personas \
  -H "Authorization: Bearer <tu_token>"
```

Ver más ejemplos en [API_USAGE_EXAMPLES.md](./docs/API_USAGE_EXAMPLES.md)

## 📁 Estructura del Proyecto

```
micasa-backend/
├── src/
│   ├── config/              # Configuraciones del sistema
│   │   ├── database.ts      # Cliente Prisma
│   │   ├── jwt.ts           # Configuración JWT
│   │   └── swagger.ts       # Configuración Swagger/OpenAPI
│   │
│   ├── controllers/         # Controladores (manejo de requests)
│   │   ├── auth.controller.ts
│   │   ├── personas.controller.ts
│   │   ├── usuarios.controller.ts
│   │   ├── roles.controller.ts
│   │   ├── permisos.controller.ts
│   │   ├── ministerios.controller.ts
│   │   ├── familias.controller.ts
│   │   ├── contactos.controller.ts
│   │   ├── eventos.controller.ts
│   │   └── auditoria.controller.ts
│   │
│   ├── routes/              # Definición de rutas
│   │   ├── index.ts         # Router principal
│   │   ├── auth.routes.ts
│   │   ├── personas.routes.ts
│   │   ├── usuarios.routes.ts
│   │   ├── roles.routes.ts
│   │   ├── permisos.routes.ts
│   │   ├── ministerios.routes.ts
│   │   ├── familias.routes.ts
│   │   ├── contactos.routes.ts
│   │   ├── eventos.routes.ts
│   │   └── auditoria.routes.ts
│   │
│   ├── services/            # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── personas.service.ts
│   │   ├── usuarios.service.ts
│   │   ├── roles.service.ts
│   │   ├── permisos.service.ts
│   │   ├── ministerios.service.ts
│   │   ├── familias.service.ts
│   │   ├── contactos.service.ts
│   │   ├── eventos.service.ts
│   │   ├── asistencias.service.ts
│   │   └── auditoria.service.ts
│   │
│   ├── middlewares/         # Middlewares personalizados
│   │   ├── auth.middleware.ts          # Autenticación JWT
│   │   ├── authorization.middleware.ts # Verificación de permisos
│   │   ├── validation.middleware.ts    # Validación con Zod
│   │   └── error.middleware.ts         # Manejo de errores
│   │
│   ├── validators/          # Esquemas de validación Zod
│   │   ├── auth.validator.ts
│   │   ├── personas.validator.ts
│   │   ├── usuarios.validator.ts
│   │   ├── roles.validator.ts
│   │   ├── ministerios.validator.ts
│   │   ├── familias.validator.ts
│   │   ├── contactos.validator.ts
│   │   └── eventos.validator.ts
│   │
│   ├── types/               # Tipos TypeScript
│   │   ├── express.d.ts     # Extensiones de Express
│   │   ├── auth.types.ts    # Tipos de autenticación
│   │   └── common.types.ts  # Tipos comunes
│   │
│   ├── utils/               # Utilidades
│   │   ├── logger.ts        # Logger Winston
│   │   ├── response.ts      # Respuestas estandarizadas
│   │   ├── pagination.ts    # Utilidad de paginación
│   │   └── constants.ts     # Constantes del sistema
│   │
│   ├── app.ts               # Configuración de Express
│   └── server.ts            # Punto de entrada
│
├── prisma/
│   ├── schema.prisma        # Schema de base de datos
│   └── seed.ts              # Datos iniciales
│
├── tests/                   # Tests unitarios y PBT
│   ├── utils/
│   └── *.test.ts
│
├── docs/                    # Documentación adicional
├── logs/                    # Archivos de log
├── .env                     # Variables de entorno (no en git)
├── .env.example             # Ejemplo de variables
├── .gitignore
├── jest.config.js           # Configuración Jest
├── tsconfig.json            # Configuración TypeScript
├── package.json
└── README.md
```

## 🔧 Módulos del Sistema

### 1. Autenticación y Autorización

**Endpoints:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/change-password` - Cambiar contraseña

**Características:**
- JWT con expiración de 8 horas
- Refresh tokens para renovación
- Permisos cacheados en el token
- Actualización de último acceso

### 2. Gestión de Personas

**Endpoints:**
- `GET /api/personas` - Listar personas (paginado)
- `GET /api/personas/:id` - Obtener persona por ID
- `GET /api/personas/identificacion/:id` - Buscar por identificación
- `GET /api/personas/search?q=term` - Buscar por nombre
- `POST /api/personas` - Crear persona
- `PUT /api/personas/:id` - Actualizar persona
- `DELETE /api/personas/:id` - Eliminar persona (soft delete)

**Características:**
- Validación de identificación única
- Validación de fechas de bautizo
- Búsqueda por nombre e identificación
- Soft delete

### 3. Gestión de Usuarios

**Endpoints:**
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `POST /api/usuarios/:id/roles` - Asignar rol
- `DELETE /api/usuarios/:id/roles/:roleId` - Remover rol
- `GET /api/usuarios/:id/roles` - Obtener roles del usuario
- `GET /api/usuarios/:id/permisos` - Obtener permisos del usuario

**Características:**
- Contraseñas hasheadas con bcrypt
- Un usuario por persona
- Gestión de roles y permisos
- Nunca expone contraseñas en respuestas

### 4. Roles y Permisos

**Endpoints Roles:**
- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol
- `POST /api/roles/:id/permisos` - Asignar permiso a rol
- `DELETE /api/roles/:id/permisos/:permisoId` - Remover permiso
- `GET /api/roles/:id/permisos` - Obtener permisos del rol

**Endpoints Permisos:**
- `GET /api/permisos` - Listar permisos
- `GET /api/permisos/:id` - Obtener permiso por ID
- `GET /api/permisos/modulo/:modulo` - Filtrar por módulo
- `POST /api/permisos` - Crear permiso
- `PUT /api/permisos/:id` - Actualizar permiso
- `DELETE /api/permisos/:id` - Eliminar permiso

**Características:**
- Formato MODULO_ACCION para permisos
- Permisos agrupados por módulo
- Roles con múltiples permisos

### 5. Ministerios

**Endpoints:**
- `GET /api/ministerios` - Listar ministerios
- `GET /api/ministerios/:id` - Obtener ministerio por ID
- `POST /api/ministerios` - Crear ministerio
- `PUT /api/ministerios/:id` - Actualizar ministerio
- `DELETE /api/ministerios/:id` - Eliminar ministerio
- `POST /api/ministerios/:id/miembros` - Asignar persona
- `DELETE /api/ministerios/:id/miembros/:personaId` - Remover persona
- `GET /api/ministerios/:id/miembros` - Obtener miembros
- `PUT /api/ministerios/:id/miembros/:personaId` - Actualizar cargo

**Características:**
- Asignación de líder
- Miembros con cargos
- Gestión de membresía

### 6. Familias

**Endpoints:**
- `GET /api/familias` - Listar familias
- `GET /api/familias/:id` - Obtener familia por ID
- `POST /api/familias` - Crear familia
- `PUT /api/familias/:id` - Actualizar familia
- `DELETE /api/familias/:id` - Eliminar familia
- `POST /api/familias/:id/miembros` - Agregar miembro
- `DELETE /api/familias/:id/miembros/:personaId` - Remover miembro
- `GET /api/familias/:id/miembros` - Obtener miembros
- `PUT /api/familias/:id/miembros/:personaId` - Actualizar parentesco

**Características:**
- Definición de parentescos
- Una cabeza de familia por familia
- Gestión de relaciones familiares

### 7. Contactos

**Endpoints:**
- `GET /api/contactos/persona/:personaId` - Contactos de una persona
- `GET /api/contactos/:id` - Obtener contacto por ID
- `POST /api/contactos` - Crear contacto
- `PUT /api/contactos/:id` - Actualizar contacto
- `DELETE /api/contactos/:id` - Eliminar contacto
- `PUT /api/contactos/:id/principal` - Marcar como principal

**Características:**
- Múltiples contactos por persona
- Tipos: TELEFONO, EMAIL, WHATSAPP, OTRO
- Validación de formato según tipo
- Un contacto principal por tipo

### 8. Eventos y Asistencias

**Endpoints:**
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Obtener evento por ID
- `GET /api/eventos/fecha?start=&end=` - Filtrar por rango de fechas
- `GET /api/eventos/ministerio/:id` - Filtrar por ministerio
- `POST /api/eventos` - Crear evento
- `PUT /api/eventos/:id` - Actualizar evento
- `DELETE /api/eventos/:id` - Eliminar evento
- `POST /api/eventos/:id/asistencia` - Registrar asistencias
- `GET /api/eventos/:id/asistencia` - Obtener asistencias
- `GET /api/eventos/:id/estadisticas` - Estadísticas de asistencia

**Características:**
- Tipos de eventos: CULTO, REUNION, CONFERENCIA, RETIRO, SERVICIO, OTRO
- Registro masivo de asistencias
- Estadísticas con agregaciones de BD
- Filtros por fecha y ministerio

### 9. Auditoría

**Endpoints:**
- `GET /api/auditoria` - Listar registros de auditoría
- `GET /api/auditoria/tabla/:tabla` - Filtrar por tabla
- `GET /api/auditoria/usuario/:userId` - Filtrar por usuario
- `GET /api/auditoria/fecha?start=&end=` - Filtrar por rango de fechas
- `GET /api/auditoria/registro/:tabla/:id` - Historial de un registro

**Características:**
- Registro automático de INSERT, UPDATE, DELETE
- Datos anteriores y nuevos
- Trazabilidad completa
- Filtros múltiples

## 🔒 Seguridad

### Autenticación y Autorización

- **Contraseñas**: Hasheadas con bcrypt (factor de costo 10)
- **JWT**: Tokens con expiración de 8 horas
- **Refresh Tokens**: Tokens de renovación con expiración de 7 días
- **Permisos**: Cacheados en JWT para mejor rendimiento (ver [docs/JWT_PERMISSIONS_CACHE.md](docs/JWT_PERMISSIONS_CACHE.md))
- **RBAC**: Control de acceso basado en roles y permisos

### Protección de API

- **Rate Limiting**: 
  - General: 100 requests por minuto por IP
  - Login: 5 intentos por minuto por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para orígenes específicos
- **Validación**: Todos los inputs validados con Zod
- **Sanitización**: Prevención de inyección SQL y XSS

### Auditoría y Logging

- **Auditoría**: Registro completo de cambios en base de datos
- **Logging**: Winston con niveles info, warn, error
- **Trazabilidad**: Usuario y timestamp en todas las operaciones
- **Privacidad**: Nunca se registran contraseñas o tokens

### Mejores Prácticas

- Soft delete para entidades principales
- Validación de integridad referencial
- Transacciones para operaciones críticas
- Índices en campos de búsqueda frecuente
- Eager loading para evitar N+1 queries
- Prepared statements en todas las consultas

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor en modo desarrollo con hot-reload

# Producción
npm run build            # Compilar TypeScript a JavaScript
npm start                # Iniciar servidor en modo producción

# Base de Datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Ejecutar seeds

# Testing
npm test                 # Ejecutar todos los tests
npm run test:watch       # Ejecutar tests en modo watch
npm test -- --coverage   # Ver cobertura de código

# Calidad de Código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores de linting automáticamente
npm run format           # Formatear código con Prettier
```

## 📖 Documentación Adicional

- **[Optimización de Base de Datos](docs/DATABASE_OPTIMIZATION.md)** - Índices, eager loading, agregaciones y mejores prácticas de rendimiento
- **[Caché de Permisos en JWT](docs/JWT_PERMISSIONS_CACHE.md)** - Implementación, ventajas y consideraciones importantes sobre el cacheo de permisos
- **[Verificación de Agregaciones](docs/DATABASE_AGGREGATIONS_VERIFICATION.md)** - Validación de cálculos de estadísticas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC

## 👥 Soporte

Para preguntas o problemas:
- Abre un issue en el repositorio
- Consulta la documentación en `/api-docs`
- Revisa los logs en `logs/app.log`

---

Desarrollado con ❤️ para la gestión integral de iglesias
#   b a c k e n d _ m i c a s a _ f i n a l  
 