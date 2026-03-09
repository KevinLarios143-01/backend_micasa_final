# Arquitectura del Sistema MICASA Backend

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Arquitectura General](#arquitectura-general)
- [Capas del Sistema](#capas-del-sistema)
- [Flujos Principales](#flujos-principales)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Patrones y Convenciones](#patrones-y-convenciones)
- [Seguridad](#seguridad)
- [Rendimiento y Optimización](#rendimiento-y-optimización)

## Resumen Ejecutivo

El backend del sistema MICASA es una API RESTful construida con **Node.js**, **Express**, **TypeScript** y **Prisma ORM** que gestiona todas las operaciones de una iglesia. El sistema implementa una arquitectura en capas clara y mantenible, con separación de responsabilidades, validación robusta, autenticación JWT, autorización RBAC y auditoría completa.

### Tecnologías Principales

- **Runtime**: Node.js 18+
- **Framework Web**: Express.js
- **Lenguaje**: TypeScript (strict mode)
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: Zod
- **Logging**: Winston
- **Testing**: Jest + fast-check
- **Documentación**: Swagger/OpenAPI 3.0

### Características Clave

✅ Arquitectura en capas (Routes → Controllers → Services → Prisma → DB)
✅ Autenticación JWT con refresh tokens
✅ Autorización RBAC con permisos cacheados
✅ Validación de datos con Zod
✅ Auditoría completa de cambios
✅ Soft delete para entidades principales
✅ Paginación obligatoria (máx 100 registros)
✅ Rate limiting y seguridad con Helmet
✅ Logging estructurado con Winston
✅ Documentación Swagger completa

## Arquitectura General

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Web/Mobile)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Application                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Security Layer (Helmet, CORS, Rate Limiting)         │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │  Authentication Middleware (JWT Verification)         │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │  Authorization Middleware (Permission Check)          │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │  Validation Middleware (Zod Schemas)                  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │                    Routes Layer                        │  │
│  │  /api/auth  /api/personas  /api/usuarios  /api/roles  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │                 Controllers Layer                      │  │
│  │  (Request handling, Response formatting)               │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │                  Services Layer                        │  │
│  │  (Business logic, Validation, Audit logging)           │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │                   Prisma ORM                           │  │
│  │  (Type-safe database access, Query building)           │  │
│  └───────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  personas, usuarios, roles, permisos, ministerios, etc.     │
└─────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara y única
2. **Inyección de Dependencias**: Los servicios reciben dependencias como parámetros
3. **Inmutabilidad**: Los datos se transforman sin mutar el estado original
4. **Type Safety**: TypeScript en modo strict para prevenir errores en tiempo de compilación
5. **Fail Fast**: Validación temprana de datos en la capa de validación
6. **Single Source of Truth**: Prisma schema como fuente única de verdad para el modelo de datos

## Capas del Sistema

### 1. Capa de Seguridad (Security Layer)

**Ubicación**: `src/app.ts`

**Responsabilidades**:
- Configurar headers de seguridad HTTP (Helmet)
- Configurar CORS para orígenes permitidos
- Implementar rate limiting global y específico
- Comprimir respuestas HTTP (gzip)

**Componentes**:
```typescript
// Helmet - Headers de seguridad
app.use(helmet());

// CORS - Control de orígenes
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate Limiting - Protección contra abuso
const limiter = rateLimit({
  windowMs: 60000,  // 1 minuto
  max: 100,         // 100 requests por ventana
});
app.use(limiter);

// Compression - Respuestas gzip
app.use(compression());
```

**Decisiones de Diseño**:
- Helmet con configuración por defecto (suficiente para la mayoría de casos)
- CORS configurable por variable de entorno
- Rate limiting diferenciado: 100 req/min general, 5 req/min para login
- Compression automática para respuestas > 1KB

### 2. Capa de Autenticación (Authentication Layer)

**Ubicación**: `src/middlewares/auth.middleware.ts`

**Responsabilidades**:
- Extraer y verificar token JWT del header Authorization
- Decodificar payload del token
- Validar que el usuario siga activo en la base de datos
- Agregar información del usuario a `req.user`

**Flujo**:
```typescript
export const authMiddleware = async (req, res, next) => {
  // 1. Extraer token del header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // 2. Verificar y decodificar token
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

  // 3. Validar usuario activo (única consulta DB)
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: decoded.userId }
  });

  if (!user || !user.estado) {
    return res.status(401).json({ error: 'Usuario inactivo' });
  }

  // 4. Agregar datos del JWT a la request
  req.user = decoded; // Incluye: userId, personaId, username, roles, permissions
  next();
};
```

**Decisiones de Diseño**:
- Token en formato `Bearer <token>` (estándar OAuth 2.0)
- Validación de usuario activo en cada request (seguridad > rendimiento)
- Permisos cacheados en el token (evita consulta adicional)
- Manejo específico de errores JWT (TokenExpiredError, JsonWebTokenError)

### 3. Capa de Autorización (Authorization Layer)

**Ubicación**: `src/middlewares/authorization.middleware.ts`

**Responsabilidades**:
- Verificar que el usuario tenga el permiso requerido
- Verificar que el usuario tenga el rol requerido (opcional)
- Retornar 403 si no tiene permisos

**Flujo**:
```typescript
export const requirePermission = (permission: string) => {
  return async (req, res, next) => {
    const user = req.user;

    // Verificar permiso usando datos del JWT (sin consulta DB)
    if (!user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'No tiene permisos para realizar esta acción',
        requiredPermission: permission,
      });
    }

    next();
  };
};
```

**Decisiones de Diseño**:
- Permisos verificados desde el JWT (sin consulta DB adicional)
- Middleware de orden superior para configurar permiso requerido
- Respuesta incluye permiso requerido para debugging
- Cambios en permisos requieren nuevo login (trade-off rendimiento vs inmediatez)

### 4. Capa de Validación (Validation Layer)

**Ubicación**: `src/middlewares/validation.middleware.ts`, `src/validators/*.validator.ts`

**Responsabilidades**:
- Validar estructura y tipos de datos de entrada
- Validar reglas de negocio básicas (longitudes, formatos, rangos)
- Retornar errores descriptivos con campo y mensaje

**Flujo**:
```typescript
export const validate = (schema: ZodSchema) => {
  return async (req, res, next) => {
    try {
      // Validar req.body contra el schema
      const validated = schema.parse(req.body);
      req.body = validated; // Reemplazar con datos validados
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de Zod
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      next(error);
    }
  };
};
```

**Ejemplo de Schema**:
```typescript
// src/validators/personas.validator.ts
export const CreatePersonaSchema = z.object({
  primer_nombre: z.string().min(1).max(50),
  primer_apellido: z.string().min(1).max(50),
  identificacion: z.string().min(1),
  genero: z.enum(['M', 'F']),
  fecha_nacimiento: z.coerce.date(),
  bautizado: z.boolean().optional(),
  fecha_bautizo: z.coerce.date().optional(),
}).refine(
  (data) => !data.bautizado || !data.fecha_bautizo || 
            data.fecha_bautizo > data.fecha_nacimiento,
  { message: 'Fecha de bautizo debe ser posterior a fecha de nacimiento' }
);
```

**Decisiones de Diseño**:
- Zod para validación (type-safe, composable, descriptivo)
- Validación en middleware antes de llegar al controller
- Schemas reutilizables y componibles
- Validaciones complejas con `.refine()` para reglas de negocio

### 5. Capa de Rutas (Routes Layer)

**Ubicación**: `src/routes/*.routes.ts`

**Responsabilidades**:
- Definir endpoints HTTP (GET, POST, PUT, DELETE)
- Aplicar middlewares en orden correcto
- Conectar endpoints con controllers
- Documentar endpoints con JSDoc para Swagger

**Estructura**:
```typescript
// src/routes/personas.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreatePersonaSchema } from '../validators/personas.validator';
import { personasController } from '../controllers/personas.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Listar personas
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personas
 */
router.get('/', 
  requirePermission('PERSONAS_READ'), 
  personasController.getAll
);

router.post('/', 
  requirePermission('PERSONAS_CREATE'),
  validate(CreatePersonaSchema),
  personasController.create
);

export default router;
```

**Decisiones de Diseño**:
- Un archivo de rutas por módulo/entidad
- Middlewares aplicados en orden: auth → authorization → validation → controller
- Documentación Swagger con JSDoc
- Router principal en `src/routes/index.ts` que monta todos los routers

### 6. Capa de Controladores (Controllers Layer)

**Ubicación**: `src/controllers/*.controller.ts`

**Responsabilidades**:
- Recibir y parsear request (query params, path params, body)
- Llamar al servicio correspondiente
- Formatear respuesta (success/error)
- Manejar errores y pasar al error handler

**Estructura**:
```typescript
// src/controllers/personas.controller.ts
class PersonasController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer parámetros de paginación
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // 2. Llamar al servicio
      const result = await personasService.getAll(page, limit);

      // 3. Formatear y retornar respuesta
      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
      });
    } catch (error) {
      next(error); // Pasar al error handler
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer datos validados del body
      const personaData = req.body;
      const userId = req.user?.userId;

      // 2. Llamar al servicio
      const persona = await personasService.create(personaData, userId);

      // 3. Retornar respuesta 201 Created
      res.status(201).json({
        success: true,
        data: persona,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const personasController = new PersonasController();
```

**Decisiones de Diseño**:
- Controllers como clases con métodos async
- No contienen lógica de negocio (solo orquestación)
- Siempre usan try-catch y pasan errores al error handler
- Respuestas estandarizadas con `{ success, data, metadata?, error? }`
- Códigos HTTP apropiados (200, 201, 400, 401, 403, 404, 409, 500)

### 7. Capa de Servicios (Services Layer)

**Ubicación**: `src/services/*.service.ts`

**Responsabilidades**:
- Implementar lógica de negocio
- Interactuar con Prisma para acceso a datos
- Validar reglas de negocio complejas
- Registrar cambios en auditoría
- Manejar transacciones

**Estructura**:
```typescript
// src/services/personas.service.ts
class PersonasService {
  async getAll(page: number, limit: number) {
    // Validar y ajustar parámetros
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    // Consultar datos y total en paralelo
    const [data, total] = await Promise.all([
      prisma.personas.findMany({
        where: { estado: true },
        skip,
        take: validLimit,
        orderBy: { primer_nombre: 'asc' },
      }),
      prisma.personas.count({ where: { estado: true } }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / validLimit);
    return {
      data,
      metadata: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }

  async create(data: CreatePersonaDTO, userId?: number) {
    // Validar unicidad de identificación
    const existing = await prisma.personas.findFirst({
      where: { identificacion: data.identificacion },
    });
    if (existing) {
      throw new Error('Ya existe una persona con esta identificación');
    }

    // Crear persona
    const persona = await prisma.personas.create({
      data: {
        ...data,
        estado: true,
        fecha_creacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    // Registrar en auditoría
    await auditoriaService.log({
      tabla: 'personas',
      id_registro: persona.id_persona,
      accion: 'INSERT',
      datos_nuevos: persona,
      id_usuario: userId,
    });

    return persona;
  }

  async delete(id: number, userId?: number) {
    // Obtener datos anteriores para auditoría
    const persona = await prisma.personas.findUnique({
      where: { id_persona: id },
    });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Soft delete
    const updated = await prisma.personas.update({
      where: { id_persona: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    // Registrar en auditoría
    await auditoriaService.log({
      tabla: 'personas',
      id_registro: id,
      accion: 'DELETE',
      datos_anteriores: persona,
      id_usuario: userId,
    });

    return updated;
  }
}

export const personasService = new PersonasService();
```

**Decisiones de Diseño**:
- Servicios como clases singleton (exportar instancia)
- Toda la lógica de negocio en servicios (no en controllers)
- Validaciones de negocio complejas (unicidad, integridad referencial)
- Registro automático en auditoría para INSERT, UPDATE, DELETE
- Uso de transacciones para operaciones atómicas
- Eager loading con `include` para evitar N+1 queries

### 8. Capa de Acceso a Datos (Data Access Layer)

**Ubicación**: `src/config/database.ts`, Prisma Client

**Responsabilidades**:
- Proporcionar cliente Prisma configurado
- Manejar conexión a base de datos
- Ejecutar queries type-safe
- Gestionar transacciones

**Configuración**:
```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

**Decisiones de Diseño**:
- Prisma como ORM (type-safe, migrations, introspection)
- Logging de queries en desarrollo (debugging)
- Singleton global del cliente Prisma
- Desconexión automática en shutdown
- Schema como fuente única de verdad

### 9. Capa de Manejo de Errores (Error Handling Layer)

**Ubicación**: `src/middlewares/error.middleware.ts`

**Responsabilidades**:
- Capturar todos los errores no manejados
- Formatear errores de forma consistente
- Mapear errores de Prisma a códigos HTTP
- Registrar errores en logs
- No exponer detalles técnicos al cliente

**Estructura**:
```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    user: req.user?.username,
  });

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Violación de unicidad
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un registro con estos datos',
        field: error.meta?.target,
      });
    }
    // P2025: Registro no encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado',
      });
    }
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
};
```

**Decisiones de Diseño**:
- Error handler como último middleware
- Logging completo de errores con contexto
- Mapeo de errores de Prisma a códigos HTTP apropiados
- Nunca exponer stack traces o detalles técnicos al cliente
- Respuestas de error consistentes con formato estándar

## Flujos Principales

### Flujo 1: Autenticación (Login)

```
┌──────┐                                                      ┌──────────┐
│Client│                                                      │PostgreSQL│
└──┬───┘                                                      └────┬─────┘
   │                                                               │
   │ POST /api/auth/login                                          │
   │ {usuario, clave}                                              │
   ├──────────────────────────────────────────────────────────────┤
   │                                                               │
   │ 1. Security Layer (Rate Limiting: 5 req/min)                 │
   │ 2. Validation Layer (LoginSchema)                            │
   │ 3. Auth Controller                                            │
   │ 4. Auth Service                                               │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ SELECT usuarios WHERE usuario = ?                       │
   │    │ INCLUDE persona, usuarios_roles, roles, permisos        │
   │    ├─────────────────────────────────────────────────────────┤
   │    │                                                          │
   │    │ 5. Verificar contraseña (bcrypt.compare)                │
   │    │ 6. Extraer roles activos                                │
   │    │ 7. Extraer permisos únicos                              │
   │    │ 8. Generar JWT con payload:                             │
   │    │    {userId, personaId, username, roles, permissions}    │
   │    │                                                          │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ UPDATE usuarios SET ultimo_acceso = NOW()               │
   │    ├─────────────────────────────────────────────────────────┤
   │    │                                                          │
   │◄───┤ 200 OK                                                  │
   │    │ {token, refreshToken, user}                             │
   │    │                                                          │
```

**Pasos Detallados**:

1. **Rate Limiting**: Máximo 5 intentos de login por minuto por IP
2. **Validación**: Schema valida que usuario y clave no estén vacíos
3. **Búsqueda de Usuario**: Query con eager loading de roles y permisos (evita N+1)
4. **Verificación de Contraseña**: bcrypt.compare() con hash almacenado
5. **Extracción de Roles**: Filtrar roles activos del usuario
6. **Extracción de Permisos**: Flatmap de permisos de todos los roles, eliminar duplicados
7. **Generación de Token**: JWT con expiración de 8 horas, incluye permisos cacheados
8. **Actualización de Último Acceso**: Timestamp para auditoría
9. **Respuesta**: Token, refresh token y datos del usuario (sin contraseña)

**Optimizaciones**:
- Una sola query con `include` para obtener usuario, roles y permisos
- Permisos cacheados en JWT (evita consultas en cada request)
- bcrypt con factor de costo 10 (balance seguridad/rendimiento)

### Flujo 2: Autorización (Request Protegido)

```
┌──────┐                                                      ┌──────────┐
│Client│                                                      │PostgreSQL│
└──┬───┘                                                      └────┬─────┘
   │                                                               │
   │ GET /api/personas                                             │
   │ Authorization: Bearer <token>                                 │
   ├──────────────────────────────────────────────────────────────┤
   │                                                               │
   │ 1. Security Layer (Rate Limiting: 100 req/min)               │
   │ 2. Auth Middleware                                            │
   │    ├─ Extraer token del header                               │
   │    ├─ Verificar firma JWT                                    │
   │    ├─ Decodificar payload                                    │
   │    │                                                          │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ SELECT usuarios WHERE id_usuario = ?                    │
   │    ├─────────────────────────────────────────────────────────┤
   │    │                                                          │
   │    ├─ Validar usuario activo                                 │
   │    └─ Agregar req.user = decoded                             │
   │                                                               │
   │ 3. Authorization Middleware                                   │
   │    ├─ Verificar req.user.permissions.includes('PERSONAS_READ')│
   │    └─ ✅ Permiso concedido (sin consulta DB)                 │
   │                                                               │
   │ 4. Personas Controller                                        │
   │ 5. Personas Service                                           │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ SELECT personas WHERE estado = true                     │
   │    │ LIMIT 10 OFFSET 0                                       │
   │    ├─────────────────────────────────────────────────────────┤
   │    │                                                          │
   │◄───┤ 200 OK                                                  │
   │    │ {success: true, data: [...], metadata: {...}}           │
   │    │                                                          │
```

**Pasos Detallados**:

1. **Rate Limiting**: Máximo 100 requests por minuto por IP
2. **Autenticación**: 
   - Extraer token del header `Authorization: Bearer <token>`
   - Verificar firma JWT con JWT_SECRET
   - Decodificar payload (incluye permisos cacheados)
   - Validar usuario activo (única consulta DB)
3. **Autorización**:
   - Verificar permiso usando `req.user.permissions` (del JWT)
   - **Sin consulta adicional a la base de datos**
4. **Procesamiento**:
   - Controller extrae parámetros de paginación
   - Service ejecuta query con paginación
   - Retorna datos y metadata

**Optimizaciones**:
- Permisos verificados desde JWT (sin consulta DB)
- Solo una consulta DB para validar usuario activo
- Paginación obligatoria (máximo 100 registros)

### Flujo 3: Auditoría (Registro de Cambios)

```
┌──────┐                                                      ┌──────────┐
│Client│                                                      │PostgreSQL│
└──┬───┘                                                      └────┬─────┘
   │                                                               │
   │ PUT /api/personas/123                                         │
   │ {primer_nombre: "Juan Actualizado"}                           │
   ├──────────────────────────────────────────────────────────────┤
   │                                                               │
   │ 1-3. Security, Auth, Authorization (como flujo anterior)      │
   │ 4. Validation Layer (UpdatePersonaSchema)                     │
   │ 5. Personas Controller                                        │
   │ 6. Personas Service                                           │
   │    │                                                          │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ SELECT personas WHERE id_persona = 123                  │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ datosAnteriores = {...}                                 │
   │    │                                                          │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ UPDATE personas SET primer_nombre = ?, ...              │
   │    │ WHERE id_persona = 123                                  │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ datosNuevos = {...}                                     │
   │    │                                                          │
   │    │ 7. Auditoria Service                                    │
   │    ├─────────────────────────────────────────────────────────┤
   │    │ INSERT INTO auditoria (                                 │
   │    │   tabla, id_registro, accion,                           │
   │    │   datos_anteriores, datos_nuevos,                       │
   │    │   id_usuario, fecha_accion                              │
   │    │ ) VALUES (                                              │
   │    │   'personas', 123, 'UPDATE',                            │
   │    │   {...datosAnteriores}, {...datosNuevos},              │
   │    │   456, NOW()                                            │
   │    │ )                                                       │
   │    ├─────────────────────────────────────────────────────────┤
   │    │                                                          │
   │◄───┤ 200 OK                                                  │
   │    │ {success: true, data: {...personaActualizada}}          │
   │    │                                                          │
```

**Pasos Detallados**:

1. **Obtener Datos Anteriores**: Query para obtener estado actual antes de actualizar
2. **Actualizar Registro**: Ejecutar UPDATE con nuevos datos
3. **Registrar en Auditoría**:
   - Tabla: nombre de la tabla afectada
   - ID Registro: ID del registro modificado
   - Acción: INSERT, UPDATE o DELETE
   - Datos Anteriores: Estado antes del cambio (null para INSERT)
   - Datos Nuevos: Estado después del cambio (null para DELETE)
   - Usuario: ID del usuario que realizó la acción
   - Fecha: Timestamp automático

**Tipos de Acciones**:
- **INSERT**: Solo `datos_nuevos`
- **UPDATE**: `datos_anteriores` y `datos_nuevos`
- **DELETE**: Solo `datos_anteriores` (soft delete: estado = false)

## Decisiones de Diseño

### 1. Soft Delete vs Hard Delete

**Decisión**: Usar **soft delete** para entidades principales

**Implementación**:
```typescript
// En lugar de DELETE
await prisma.personas.delete({ where: { id: 123 } });

// Usamos UPDATE
await prisma.personas.update({
  where: { id: 123 },
  data: { estado: false }
});
```

**Razones**:
- ✅ Preserva datos históricos
- ✅ Permite recuperación de registros eliminados
- ✅ Mantiene integridad referencial
- ✅ Facilita auditoría y trazabilidad
- ✅ Cumple con regulaciones de retención de datos

**Trade-offs**:
- ❌ Queries deben filtrar por `estado = true`
- ❌ Índices de unicidad deben considerar estado
- ❌ Mayor uso de espacio en disco

**Aplicado a**: personas, usuarios, roles, permisos, ministerios, familias, contactos, eventos

### 2. Paginación Obligatoria

**Decisión**: Todas las listas deben estar paginadas con **máximo 100 registros**

**Implementación**:
```typescript
// src/utils/pagination.ts
export const paginateResults = async (
  model: any,
  page: number = 1,
  limit: number = 10,
  where: any = {}
) => {
  // Validar y ajustar parámetros
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit)); // Máximo 100
  const skip = (validPage - 1) * validLimit;

  // Consultar datos y total en paralelo
  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take: validLimit }),
    model.count({ where }),
  ]);

  // Calcular metadata
  const totalPages = Math.ceil(total / validLimit);
  return {
    data,
    metadata: {
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    },
  };
};
```

**Razones**:
- ✅ Previene sobrecarga del servidor con queries grandes
- ✅ Mejora tiempo de respuesta
- ✅ Reduce uso de memoria
- ✅ Mejor experiencia de usuario (carga progresiva)

**Valores por Defecto**:
- Página: 1
- Límite: 10
- Máximo: 100

**Metadata Incluida**:
- `total`: Total de registros
- `page`: Página actual
- `limit`: Registros por página
- `totalPages`: Total de páginas
- `hasNextPage`: Booleano
- `hasPrevPage`: Booleano

### 3. Permisos Cacheados en JWT

**Decisión**: Incluir roles y permisos en el payload del JWT

**Implementación**:
```typescript
const payload: JWTPayload = {
  userId: user.id_usuario,
  personaId: user.id_persona,
  username: user.usuario,
  roles: ['Administrador', 'Pastor'],
  permissions: ['PERSONAS_READ', 'PERSONAS_CREATE', ...],
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
```

**Razones**:
- ✅ Reduce consultas DB en 50% (no consultar permisos en cada request)
- ✅ Mejora tiempo de respuesta (~20-50ms por request)
- ✅ Simplifica middleware de autorización
- ✅ Escalable con múltiples usuarios concurrentes

**Trade-offs**:
- ❌ Cambios en permisos requieren nuevo login (máximo 8 horas)
- ❌ Aumenta tamaño del token (~800-1200 bytes)
- ❌ Permisos visibles en el token (decodificable con base64)

**Mitigaciones**:
- Token firmado (no modificable sin JWT_SECRET)
- HTTPS obligatorio en producción
- Validación de usuario activo en cada request
- Expiración de 8 horas (ventana limitada)

**Documentación**: Ver [docs/JWT_PERMISSIONS_CACHE.md](JWT_PERMISSIONS_CACHE.md)

### 4. Bcrypt para Contraseñas

**Decisión**: Usar **bcrypt** con factor de costo **10**

**Implementación**:
```typescript
// Al crear usuario
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Al verificar login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Razones**:
- ✅ Algoritmo probado y seguro
- ✅ Resistente a ataques de fuerza bruta
- ✅ Factor de costo ajustable
- ✅ Salt automático por hash

**Factor de Costo 10**:
- Balance entre seguridad y rendimiento
- ~100ms por hash (aceptable para login)
- 2^10 = 1024 iteraciones

**Reglas**:
- Nunca almacenar contraseñas en texto plano
- Nunca retornar hash en respuestas API
- Nunca registrar contraseñas en logs
- Validar longitud mínima de 8 caracteres

### 5. Validación con Zod

**Decisión**: Usar **Zod** para validación de datos de entrada

**Razones**:
- ✅ Type-safe (inferencia de tipos TypeScript)
- ✅ Composable (schemas reutilizables)
- ✅ Descriptivo (mensajes de error claros)
- ✅ Validaciones complejas con `.refine()`
- ✅ Coerción de tipos (strings a dates, numbers)

**Ejemplo**:
```typescript
const CreatePersonaSchema = z.object({
  primer_nombre: z.string().min(1).max(50),
  fecha_nacimiento: z.coerce.date(),
  genero: z.enum(['M', 'F']),
}).refine(
  (data) => data.fecha_nacimiento < new Date(),
  { message: 'Fecha de nacimiento debe ser en el pasado' }
);

// Inferir tipo TypeScript
type CreatePersonaDTO = z.infer<typeof CreatePersonaSchema>;
```

**Alternativas Consideradas**:
- Joi: Menos type-safe
- class-validator: Requiere decoradores
- Yup: Menos performante

### 6. Arquitectura en Capas

**Decisión**: Separar responsabilidades en capas claras

**Capas**:
1. **Routes**: Definición de endpoints y middlewares
2. **Controllers**: Manejo de requests/responses
3. **Services**: Lógica de negocio
4. **Prisma**: Acceso a datos

**Razones**:
- ✅ Separación de responsabilidades (SRP)
- ✅ Testeable (cada capa se puede testear independientemente)
- ✅ Mantenible (cambios localizados)
- ✅ Escalable (fácil agregar nuevas features)
- ✅ Reutilizable (servicios usables desde múltiples controllers)

**Reglas**:
- Controllers NO contienen lógica de negocio
- Services NO manejan requests/responses
- Prisma queries SOLO en services
- Validación en middleware ANTES de controller

### 7. Auditoría Automática

**Decisión**: Registrar automáticamente todos los cambios (INSERT, UPDATE, DELETE)

**Implementación**:
```typescript
// En cada servicio
await auditoriaService.log({
  tabla: 'personas',
  id_registro: persona.id_persona,
  accion: 'UPDATE',
  datos_anteriores: oldData,
  datos_nuevos: newData,
  id_usuario: userId,
});
```

**Razones**:
- ✅ Trazabilidad completa
- ✅ Cumplimiento regulatorio
- ✅ Debugging y troubleshooting
- ✅ Recuperación de datos
- ✅ Análisis de comportamiento

**Datos Registrados**:
- Tabla afectada
- ID del registro
- Acción (INSERT, UPDATE, DELETE)
- Datos anteriores (UPDATE, DELETE)
- Datos nuevos (INSERT, UPDATE)
- Usuario que realizó la acción
- Timestamp automático

### 8. Rate Limiting Diferenciado

**Decisión**: Implementar rate limiting con límites diferentes por endpoint

**Implementación**:
```typescript
// Rate limiting general: 100 req/min
const generalLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
});

// Rate limiting para login: 5 req/min
const loginLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
});

app.use(generalLimiter);
app.use('/api/auth/login', loginLimiter);
```

**Razones**:
- ✅ Protección contra ataques de fuerza bruta (login)
- ✅ Protección contra abuso de API (general)
- ✅ Prevención de DoS
- ✅ Control de costos de infraestructura

**Límites**:
- General: 100 requests/minuto por IP
- Login: 5 intentos/minuto por IP

### 9. Eager Loading para Evitar N+1

**Decisión**: Usar `include` de Prisma para cargar relaciones

**Problema N+1**:
```typescript
// ❌ MAL: N+1 queries
const users = await prisma.usuarios.findMany();
for (const user of users) {
  const persona = await prisma.personas.findUnique({
    where: { id: user.id_persona }
  });
}
// 1 query + N queries = N+1 queries
```

**Solución con Eager Loading**:
```typescript
// ✅ BIEN: 1 query
const users = await prisma.usuarios.findMany({
  include: {
    persona: true,
    usuarios_roles: {
      include: {
        roles: true
      }
    }
  }
});
// Solo 1 query con JOINs
```

**Razones**:
- ✅ Reduce número de queries a la DB
- ✅ Mejora rendimiento significativamente
- ✅ Simplifica código

**Documentación**: Ver [docs/DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)

### 10. Índices en Base de Datos

**Decisión**: Crear índices en campos de búsqueda frecuente y claves foráneas

**Índices Implementados**:
- Campos de búsqueda: `identificacion`, `usuario`, `(primer_nombre, primer_apellido)`
- Todas las claves foráneas
- Campos de filtrado: `fecha_inicio`, `tabla`, `fecha_accion`

**Razones**:
- ✅ Mejora velocidad de búsquedas
- ✅ Optimiza JOINs
- ✅ Reduce tiempo de respuesta

**Trade-offs**:
- ❌ Mayor uso de espacio en disco
- ❌ Inserts/Updates ligeramente más lentos

**Documentación**: Ver [docs/DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)

## Patrones y Convenciones

### Patrones de Diseño Utilizados

#### 1. Singleton Pattern
**Uso**: Servicios, Prisma Client, Logger

```typescript
// Exportar instancia única
export const personasService = new PersonasService();
export const prisma = new PrismaClient();
export const logger = winston.createLogger({...});
```

#### 2. Middleware Pattern
**Uso**: Express middlewares (auth, validation, error handling)

```typescript
export const authMiddleware = async (req, res, next) => {
  // Procesar request
  // Modificar req.user
  next(); // Pasar al siguiente middleware
};
```

#### 3. Factory Pattern
**Uso**: Creación de respuestas estandarizadas

```typescript
export const successResponse = (data: any, metadata?: any) => ({
  success: true,
  data,
  metadata,
});

export const errorResponse = (error: string) => ({
  success: false,
  error,
});
```

#### 4. Repository Pattern (implícito)
**Uso**: Servicios actúan como repositorios

```typescript
class PersonasService {
  async getAll() { /* ... */ }
  async getById(id) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

### Convenciones de Código

#### Nomenclatura

**Archivos**:
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.routes.ts`
- Validators: `*.validator.ts`
- Middlewares: `*.middleware.ts`
- Types: `*.types.ts`

**Clases y Interfaces**:
- PascalCase: `PersonasController`, `AuthService`
- Interfaces con prefijo `I`: `IAuthController`, `IPersona`

**Variables y Funciones**:
- camelCase: `getUserById`, `personaData`
- Constantes: UPPER_SNAKE_CASE: `JWT_SECRET`, `BCRYPT_ROUNDS`

**Tipos TypeScript**:
- Sufijo `DTO`: `CreatePersonaDTO`, `LoginDTO`
- Sufijo `Result`: `AuthResult`, `PaginatedResult`

#### Estructura de Archivos

**Controllers**:
```typescript
class EntityController {
  async getAll(req, res, next) { /* ... */ }
  async getById(req, res, next) { /* ... */ }
  async create(req, res, next) { /* ... */ }
  async update(req, res, next) { /* ... */ }
  async delete(req, res, next) { /* ... */ }
}

export const entityController = new EntityController();
```

**Services**:
```typescript
class EntityService {
  async getAll(page, limit, filters) { /* ... */ }
  async getById(id) { /* ... */ }
  async create(data, userId) { /* ... */ }
  async update(id, data, userId) { /* ... */ }
  async delete(id, userId) { /* ... */ }
}

export const entityService = new EntityService();
```

**Routes**:
```typescript
const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('ENTITY_READ'), controller.getAll);
router.get('/:id', requirePermission('ENTITY_READ'), controller.getById);
router.post('/', requirePermission('ENTITY_CREATE'), validate(CreateSchema), controller.create);
router.put('/:id', requirePermission('ENTITY_UPDATE'), validate(UpdateSchema), controller.update);
router.delete('/:id', requirePermission('ENTITY_DELETE'), controller.delete);

export default router;
```

#### Manejo de Errores

**En Controllers**:
```typescript
async create(req, res, next) {
  try {
    const data = req.body;
    const result = await service.create(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // Pasar al error handler
  }
}
```

**En Services**:
```typescript
async create(data) {
  // Validaciones de negocio
  if (await this.exists(data.identificacion)) {
    throw new Error('Ya existe un registro con esta identificación');
  }
  
  // Operación
  const result = await prisma.entity.create({ data });
  return result;
}
```

#### Respuestas Estandarizadas

**Success**:
```json
{
  "success": true,
  "data": { /* ... */ },
  "metadata": { /* paginación */ }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Mensaje descriptivo",
  "field": "campo_con_error"
}
```

## Seguridad

### Autenticación

- **JWT**: Tokens con expiración de 8 horas
- **Refresh Tokens**: Tokens de renovación con expiración de 7 días
- **Bcrypt**: Contraseñas hasheadas con factor de costo 10
- **Validación**: Usuario activo verificado en cada request

### Autorización

- **RBAC**: Control de acceso basado en roles y permisos
- **Permisos Granulares**: Formato `MODULO_ACCION` (ej: `PERSONAS_CREATE`)
- **Middleware**: Verificación antes de ejecutar controller
- **Cache**: Permisos en JWT para mejor rendimiento

### Protección de API

- **Rate Limiting**: 100 req/min general, 5 req/min login
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para orígenes específicos
- **Validación**: Todos los inputs validados con Zod
- **Sanitización**: Prisma usa prepared statements (previene SQL injection)

### Datos Sensibles

- **Contraseñas**: Nunca almacenadas en texto plano
- **Hashes**: Nunca retornados en respuestas API
- **Tokens**: Nunca registrados en logs
- **Información Personal**: Protegida con permisos apropiados

### Auditoría

- **Registro Completo**: Todos los cambios registrados
- **Trazabilidad**: Usuario y timestamp en cada operación
- **Integridad**: Datos anteriores y nuevos preservados
- **Consulta**: Endpoints para auditar cambios

## Rendimiento y Optimización

### Optimizaciones Implementadas

#### 1. Permisos Cacheados en JWT
- **Beneficio**: Reduce consultas DB en 50%
- **Impacto**: ~20-50ms menos por request
- **Documentación**: [JWT_PERMISSIONS_CACHE.md](JWT_PERMISSIONS_CACHE.md)

#### 2. Eager Loading
- **Beneficio**: Evita N+1 queries
- **Implementación**: `include` en queries de Prisma
- **Documentación**: [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)

#### 3. Índices en Base de Datos
- **Beneficio**: Búsquedas más rápidas
- **Implementación**: Índices en campos frecuentes y FKs
- **Documentación**: [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)

#### 4. Paginación Obligatoria
- **Beneficio**: Previene queries grandes
- **Límite**: Máximo 100 registros por página
- **Impacto**: Respuestas más rápidas y predecibles

#### 5. Agregaciones en Base de Datos
- **Beneficio**: Cálculos en DB (más rápido)
- **Uso**: Estadísticas de asistencia
- **Implementación**: `count()`, `sum()`, `avg()` de Prisma

#### 6. Queries en Paralelo
- **Beneficio**: Reduce tiempo total
- **Implementación**: `Promise.all()` para queries independientes
- **Ejemplo**: Obtener datos y total simultáneamente

#### 7. Compression
- **Beneficio**: Reduce tamaño de respuestas
- **Implementación**: Middleware `compression` (gzip)
- **Impacto**: ~70% reducción en tamaño de respuestas

### Métricas Esperadas

Con las optimizaciones implementadas:

| Operación | Tiempo Esperado |
|-----------|----------------|
| Búsqueda por identificación | < 5ms |
| Búsqueda por nombre | < 10ms |
| Listado paginado | < 50ms |
| Login con permisos | < 100ms |
| Estadísticas de asistencia | < 100ms |
| Request protegido (con auth) | < 50ms |

### Recomendaciones para Producción

1. **Connection Pooling**: Configurar pool de conexiones en Prisma
2. **Caching**: Implementar Redis para datos frecuentes
3. **CDN**: Usar CDN para assets estáticos
4. **Load Balancing**: Múltiples instancias con balanceador
5. **Monitoring**: APM (New Relic, DataDog) para métricas
6. **Query Logging**: Identificar queries lentas (> 100ms)

---

**Última actualización**: 2024
**Versión del documento**: 1.0
**Mantenido por**: Equipo de Desarrollo MICASA
