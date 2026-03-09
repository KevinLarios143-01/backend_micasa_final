# Documento de Diseño: Backend Sistema de Gestión de Iglesia MICASA

## Resumen General

El backend del sistema MICASA es una API RESTful construida con Node.js, Express y TypeScript que gestiona todas las operaciones de una iglesia incluyendo personas, usuarios, roles, permisos, ministerios, familias, contactos, eventos y asistencias. El sistema implementa autenticación JWT, autorización basada en roles y permisos, auditoría completa de cambios y validación robusta de datos. Utiliza Prisma ORM para interactuar con PostgreSQL y está documentado completamente con Swagger/OpenAPI.

## Arquitectura del Sistema

### Arquitectura General

```mermaid
graph TB
    Client[Cliente Web/Mobile] --> API[API Gateway/Express]
    API --> Auth[Middleware Autenticación]
    Auth --> Authz[Middleware Autorización]
    Authz --> Routes[Routes]
    Routes --> Controllers[Controllers]
    Controllers --> Services[Services]
    Services --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
    
    Controllers --> Validators[Validators]
    Controllers --> ErrorHandler[Error Handler]
    Services --> Audit[Audit Service]
    Audit --> DB
    
    style API fill:#4a90e2
    style DB fill:#2ecc71
    style Auth fill:#e74c3c
    style Authz fill:#e67e22
```

### Estructura de Carpetas

```
micasa-backend/
├── src/
│   ├── config/              # Configuraciones (DB, JWT, Swagger)
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   └── swagger.ts
│   ├── controllers/         # Controladores por entidad
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
│   ├── routes/              # Rutas por módulo
│   │   ├── index.ts
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
│   │   └── auditoria.service.ts
│   ├── middlewares/         # Middlewares personalizados
│   │   ├── auth.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/          # Esquemas de validación
│   │   ├── personas.validator.ts
│   │   ├── usuarios.validator.ts
│   │   ├── roles.validator.ts
│   │   ├── ministerios.validator.ts
│   │   ├── familias.validator.ts
│   │   ├── contactos.validator.ts
│   │   └── eventos.validator.ts
│   ├── types/               # Tipos TypeScript
│   │   ├── express.d.ts
│   │   ├── auth.types.ts
│   │   └── common.types.ts
│   ├── utils/               # Utilidades
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   └── constants.ts
│   ├── prisma/              # Prisma
│   │   └── schema.prisma
│   ├── app.ts               # Configuración Express
│   └── server.ts            # Punto de entrada
├── tests/                   # Tests
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as Auth Controller
    participant S as Auth Service
    participant DB as PostgreSQL
    participant J as JWT Utils
    
    C->>A: POST /api/auth/login {usuario, clave}
    A->>S: login(usuario, clave)
    S->>DB: Buscar usuario por nombre
    DB-->>S: Usuario encontrado
    S->>S: Verificar hash bcrypt
    S->>DB: Obtener roles y permisos
    DB-->>S: Roles y permisos
    S->>J: Generar JWT token
    J-->>S: Token generado
    S->>DB: Actualizar ultimo_acceso
    S-->>A: {token, usuario, roles, permisos}
    A-->>C: 200 OK {token, data}
```

### Flujo de Autorización

```mermaid
sequenceDiagram
    participant C as Cliente
    participant AM as Auth Middleware
    participant AZ as Authorization Middleware
    participant CT as Controller
    participant DB as PostgreSQL
    
    C->>AM: Request + JWT Token
    AM->>AM: Verificar token JWT
    AM->>AM: Decodificar payload
    AM->>DB: Validar usuario activo
    DB-->>AM: Usuario válido
    AM->>AZ: Request + User data
    AZ->>DB: Verificar permisos del usuario
    DB-->>AZ: Permisos del usuario
    AZ->>AZ: Validar permiso requerido
    AZ->>CT: Request autorizado
    CT->>CT: Procesar solicitud
    CT-->>C: Response
```

## Componentes e Interfaces

### Componente 1: Auth Controller

**Propósito**: Gestionar autenticación y autorización de usuarios

**Interface**:
```typescript
interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- Validar credenciales de usuario
- Generar y refrescar tokens JWT
- Gestionar cierre de sesión
- Cambio de contraseña
- Retornar información del usuario autenticado

### Componente 2: Personas Controller

**Propósito**: Gestionar CRUD completo de personas

**Interface**:
```typescript
interface IPersonasController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByIdentificacion(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD completo de personas
- Búsqueda por nombre, identificación
- Validación de datos personales
- Gestión de estado activo/inactivo

### Componente 3: Usuarios Controller

**Propósito**: Gestionar usuarios del sistema

**Interface**:
```typescript
interface IUsuariosController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  assignRole(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeRole(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserRoles(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de usuarios
- Asignación y remoción de roles
- Consulta de roles y permisos del usuario
- Gestión de estado activo/inactivo

### Componente 4: Roles y Permisos Controller

**Propósito**: Gestionar roles y permisos del sistema

**Interface**:
```typescript
interface IRolesController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  assignPermission(req: Request, res: Response, next: NextFunction): Promise<void>;
  removePermission(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void>;
}

interface IPermisosController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByModule(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de roles y permisos
- Asignación de permisos a roles
- Consulta de permisos por módulo

### Componente 5: Ministerios Controller

**Propósito**: Gestionar ministerios y asignación de personas

**Interface**:
```typescript
interface IMinisteriosController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  assignPerson(req: Request, res: Response, next: NextFunction): Promise<void>;
  removePerson(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMembers(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateMemberCargo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de ministerios
- Asignación y remoción de personas
- Gestión de cargos dentro del ministerio
- Consulta de miembros activos

### Componente 6: Familias Controller

**Propósito**: Gestionar familias y relaciones familiares

**Interface**:
```typescript
interface IFamiliasController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  addMember(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeMember(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMembers(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateMemberParentesco(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de familias
- Gestión de miembros familiares
- Definición de parentescos
- Identificación de cabeza de familia

### Componente 7: Contactos Controller

**Propósito**: Gestionar contactos adicionales de personas

**Interface**:
```typescript
interface IContactosController {
  getByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  setPrincipal(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de contactos por persona
- Gestión de contacto principal
- Validación de tipos de contacto

### Componente 8: Eventos Controller

**Propósito**: Gestionar eventos y asistencias

**Interface**:
```typescript
interface IEventosController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByDateRange(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByMinisterio(req: Request, res: Response, next: NextFunction): Promise<void>;
  registerAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAttendanceStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- CRUD de eventos
- Registro de asistencias
- Consulta de eventos por fecha y ministerio
- Estadísticas de asistencia

### Componente 9: Auditoría Controller

**Propósito**: Consultar registros de auditoría

**Interface**:
```typescript
interface IAuditoriaController {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByTable(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByDateRange(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

**Responsabilidades**:
- Consulta de registros de auditoría
- Filtrado por tabla, usuario, fecha
- Historial de cambios por registro

## Modelos de Datos

### Modelo 1: Persona

```typescript
interface Persona {
  id_persona: number;
  primer_nombre: string;
  segundo_nombre?: string;
  tercer_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: Date;
  genero: 'M' | 'F';
  bautizado: boolean;
  fecha_bautizo?: Date;
  identificacion: string;
  tipo_identificacion: 'CC' | 'TI' | 'CE' | 'PAS' | 'RC';
  estado_civil: 'S' | 'C' | 'V' | 'D' | 'U';
  celular?: string;
  email?: string;
  direccion?: string;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
}
```

**Reglas de Validación**:
- primer_nombre y primer_apellido son obligatorios
- identificacion debe ser única
- fecha_bautizo debe ser posterior a fecha_nacimiento
- genero debe ser 'M' o 'F'
- tipo_identificacion debe ser uno de: CC, TI, CE, PAS, RC
- estado_civil debe ser uno de: S, C, V, D, U
- email debe tener formato válido
- celular debe tener formato válido

### Modelo 2: Usuario

```typescript
interface Usuario {
  id_usuario: number;
  id_persona: number;
  usuario: string;
  clave: string;
  estado: boolean;
  ultimo_acceso?: Date;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  persona?: Persona;
  roles?: UsuarioRol[];
}
```

**Reglas de Validación**:
- usuario debe ser único
- id_persona debe ser único (un usuario por persona)
- clave debe almacenarse como hash bcrypt
- usuario debe tener mínimo 4 caracteres
- clave debe tener mínimo 8 caracteres (antes de hashear)

### Modelo 3: Rol

```typescript
interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  permisos?: RolPermiso[];
}
```

**Reglas de Validación**:
- nombre debe ser único
- nombre es obligatorio

### Modelo 4: Permiso

```typescript
interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
}
```

**Reglas de Validación**:
- nombre debe ser único
- modulo es obligatorio
- Formato sugerido para nombre: MODULO_ACCION (ej: PERSONAS_CREATE, EVENTOS_READ)

### Modelo 5: Ministerio

```typescript
interface Ministerio {
  id_ministerio: number;
  nombre: string;
  descripcion?: string;
  lider_id?: number;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  lider?: Persona;
  miembros?: MinisterioPersona[];
}
```

**Reglas de Validación**:
- nombre debe ser único
- lider_id debe referenciar una persona existente

### Modelo 6: Familia

```typescript
interface Familia {
  id_familia: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  miembros?: FamiliaPersona[];
}

interface FamiliaPersona {
  id_familia_persona: number;
  id_persona: number;
  id_familia: number;
  parentesco: 'PADRE' | 'MADRE' | 'HIJO' | 'HIJA' | 'ESPOSO' | 'ESPOSA' | 'ABUELO' | 'ABUELA' | 'NIETO' | 'NIETA' | 'OTRO';
  es_cabeza_familia: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  persona?: Persona;
}
```

**Reglas de Validación**:
- nombre es obligatorio
- parentesco debe ser uno de los valores permitidos
- Solo puede haber una cabeza de familia por familia

### Modelo 7: Contacto

```typescript
interface Contacto {
  id_contacto: number;
  id_persona: number;
  tipo_contacto: 'TELEFONO' | 'EMAIL' | 'WHATSAPP' | 'OTRO';
  valor: string;
  es_principal: boolean;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
}
```

**Reglas de Validación**:
- tipo_contacto debe ser uno de: TELEFONO, EMAIL, WHATSAPP, OTRO
- valor es obligatorio
- Solo puede haber un contacto principal por tipo y persona
- Si tipo_contacto es EMAIL, valor debe tener formato de email válido

### Modelo 8: Evento

```typescript
interface Evento {
  id_evento: number;
  nombre: string;
  descripcion?: string;
  tipo_evento?: 'CULTO' | 'REUNION' | 'CONFERENCIA' | 'RETIRO' | 'SERVICIO' | 'OTRO';
  fecha_inicio: Date;
  fecha_fin?: Date;
  lugar?: string;
  id_ministerio?: number;
  estado: boolean;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  usuario_modificacion?: number;
  ministerio?: Ministerio;
  asistencias?: AsistenciaEvento[];
}

interface AsistenciaEvento {
  id_asistencia: number;
  id_evento: number;
  id_persona: number;
  asistio: boolean;
  observaciones?: string;
  fecha_registro: Date;
  persona?: Persona;
}
```

**Reglas de Validación**:
- nombre es obligatorio
- fecha_inicio es obligatoria
- fecha_fin debe ser posterior a fecha_inicio
- tipo_evento debe ser uno de: CULTO, REUNION, CONFERENCIA, RETIRO, SERVICIO, OTRO
- Combinación id_evento + id_persona debe ser única en asistencias

### Modelo 9: Auditoría

```typescript
interface Auditoria {
  id_auditoria: number;
  tabla: string;
  id_registro: number;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  datos_anteriores?: any;
  datos_nuevos?: any;
  id_usuario?: number;
  fecha_accion: Date;
  usuario?: Usuario;
}
```

**Reglas de Validación**:
- tabla, id_registro y accion son obligatorios
- accion debe ser uno de: INSERT, UPDATE, DELETE
- datos_anteriores es null para INSERT
- datos_nuevos es null para DELETE

## Pseudocódigo Algorítmico

### Algoritmo Principal: Autenticación de Usuario

```typescript
async function authenticateUser(username: string, password: string): Promise<AuthResult> {
  // Precondiciones:
  // - username no es vacío
  // - password no es vacío
  
  // Paso 1: Buscar usuario por nombre de usuario
  const user = await prisma.usuarios.findUnique({
    where: { usuario: username },
    include: {
      persona: true,
      usuarios_roles: {
        include: {
          roles: {
            include: {
              roles_permisos: {
                include: { permisos: true }
              }
            }
          }
        }
      }
    }
  });
  
  // Paso 2: Validar existencia y estado del usuario
  if (!user || !user.estado) {
    throw new UnauthorizedError('Credenciales inválidas');
  }
  
  // Paso 3: Verificar contraseña con bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.clave);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }
  
  // Paso 4: Extraer roles y permisos activos
  const roles = user.usuarios_roles
    .filter(ur => ur.estado && ur.roles.estado)
    .map(ur => ur.roles.nombre);
  
  const permissions = user.usuarios_roles
    .flatMap(ur => ur.roles.roles_permisos
      .filter(rp => rp.estado && rp.permisos.estado)
      .map(rp => rp.permisos.nombre)
    );
  
  const uniquePermissions = [...new Set(permissions)];
  
  // Paso 5: Generar token JWT
  const token = jwt.sign(
    {
      userId: user.id_usuario,
      personaId: user.id_persona,
      username: user.usuario,
      roles: roles,
      permissions: uniquePermissions
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  // Paso 6: Actualizar último acceso
  await prisma.usuarios.update({
    where: { id_usuario: user.id_usuario },
    data: { ultimo_acceso: new Date() }
  });
  
  // Postcondiciones:
  // - Token JWT válido generado
  // - Usuario tiene al menos un rol activo
  // - Último acceso actualizado
  
  return {
    token,
    user: {
      id: user.id_usuario,
      username: user.usuario,
      persona: user.persona,
      roles,
      permissions: uniquePermissions
    }
  };
}
```

### Algoritmo: Verificación de Permisos

```typescript
async function checkPermission(userId: number, requiredPermission: string): Promise<boolean> {
  // Precondiciones:
  // - userId es un ID válido
  // - requiredPermission no es vacío
  
  // Paso 1: Obtener usuario con roles y permisos
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: userId },
    include: {
      usuarios_roles: {
        where: { estado: true },
        include: {
          roles: {
            where: { estado: true },
            include: {
              roles_permisos: {
                where: { estado: true },
                include: {
                  permisos: {
                    where: { estado: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  
  // Paso 2: Validar usuario existe y está activo
  if (!user || !user.estado) {
    return false;
  }
  
  // Paso 3: Extraer todos los permisos del usuario
  const userPermissions = user.usuarios_roles
    .flatMap(ur => ur.roles.roles_permisos
      .map(rp => rp.permisos.nombre)
    );
  
  // Paso 4: Verificar si el usuario tiene el permiso requerido
  const hasPermission = userPermissions.includes(requiredPermission);
  
  // Postcondiciones:
  // - Retorna true si el usuario tiene el permiso
  // - Retorna false en caso contrario
  
  return hasPermission;
}
```

### Algoritmo: Registro de Auditoría

```typescript
async function auditChange(
  table: string,
  recordId: number,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  oldData: any,
  newData: any,
  userId?: number
): Promise<void> {
  // Precondiciones:
  // - table no es vacío
  // - recordId es válido
  // - action es uno de: INSERT, UPDATE, DELETE
  
  // Paso 1: Preparar datos según la acción
  let datosAnteriores = null;
  let datosNuevos = null;
  
  if (action === 'INSERT') {
    datosNuevos = newData;
  } else if (action === 'UPDATE') {
    datosAnteriores = oldData;
    datosNuevos = newData;
  } else if (action === 'DELETE') {
    datosAnteriores = oldData;
  }
  
  // Paso 2: Crear registro de auditoría
  await prisma.auditoria.create({
    data: {
      tabla: table,
      id_registro: recordId,
      accion: action,
      datos_anteriores: datosAnteriores,
      datos_nuevos: datosNuevos,
      id_usuario: userId,
      fecha_accion: new Date()
    }
  });
  
  // Postcondiciones:
  // - Registro de auditoría creado exitosamente
  // - datos_anteriores es null para INSERT
  // - datos_nuevos es null para DELETE
}
```

### Algoritmo: Paginación de Resultados

```typescript
async function paginateResults<T>(
  model: any,
  page: number = 1,
  limit: number = 10,
  where: any = {},
  include: any = {},
  orderBy: any = {}
): Promise<PaginatedResult<T>> {
  // Precondiciones:
  // - page >= 1
  // - limit >= 1 y limit <= 100
  
  // Paso 1: Validar y ajustar parámetros
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  const skip = (validPage - 1) * validLimit;
  
  // Paso 2: Contar total de registros
  const total = await model.count({ where });
  
  // Paso 3: Obtener registros paginados
  const data = await model.findMany({
    where,
    include,
    orderBy,
    skip,
    take: validLimit
  });
  
  // Paso 4: Calcular metadatos de paginación
  const totalPages = Math.ceil(total / validLimit);
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;
  
  // Postcondiciones:
  // - data contiene máximo 'limit' registros
  // - metadata contiene información correcta de paginación
  
  return {
    data,
    metadata: {
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
}
```

## Funciones Clave con Especificaciones Formales

### Función 1: createPersona()

```typescript
async function createPersona(data: CreatePersonaDTO, userId?: number): Promise<Persona>
```

**Precondiciones:**
- `data.primer_nombre` no es vacío
- `data.primer_apellido` no es vacío
- `data.identificacion` es única en la base de datos
- `data.fecha_nacimiento` es una fecha válida en el pasado
- Si `data.bautizado` es true, `data.fecha_bautizo` debe ser posterior a `data.fecha_nacimiento`
- `data.genero` es 'M' o 'F'
- `data.tipo_identificacion` es uno de: CC, TI, CE, PAS, RC
- `data.estado_civil` es uno de: S, C, V, D, U

**Postcondiciones:**
- Retorna objeto Persona con id_persona generado
- Registro de auditoría creado con acción INSERT
- `fecha_creacion` establecida a la fecha actual
- `estado` establecido a true por defecto

**Invariantes de Bucle:** N/A

### Función 2: updatePersona()

```typescript
async function updatePersona(id: number, data: UpdatePersonaDTO, userId?: number): Promise<Persona>
```

**Precondiciones:**
- `id` corresponde a una persona existente
- Si se actualiza `identificacion`, debe ser única
- Si se actualiza `fecha_bautizo`, debe ser posterior a `fecha_nacimiento`
- Validaciones de formato para campos actualizados

**Postcondiciones:**
- Retorna objeto Persona actualizado
- Registro de auditoría creado con acción UPDATE
- `fecha_modificacion` actualizada a la fecha actual
- `usuario_modificacion` establecido al userId proporcionado
- Datos anteriores preservados en auditoría

**Invariantes de Bucle:** N/A

### Función 3: assignRoleToUser()

```typescript
async function assignRoleToUser(userId: number, roleId: number, assignedBy?: number): Promise<UsuarioRol>
```

**Precondiciones:**
- `userId` corresponde a un usuario existente y activo
- `roleId` corresponde a un rol existente y activo
- La combinación userId + roleId no existe previamente (o está inactiva)

**Postcondiciones:**
- Retorna objeto UsuarioRol creado o reactivado
- Si la asignación existía pero estaba inactiva, se reactiva
- Registro de auditoría creado
- `estado` establecido a true

**Invariantes de Bucle:** N/A

### Función 4: registerEventAttendance()

```typescript
async function registerEventAttendance(
  eventId: number,
  attendances: Array<{personaId: number, asistio: boolean, observaciones?: string}>,
  userId?: number
): Promise<AsistenciaEvento[]>
```

**Precondiciones:**
- `eventId` corresponde a un evento existente
- Todos los `personaId` en attendances corresponden a personas existentes
- Array attendances no está vacío

**Postcondiciones:**
- Retorna array de AsistenciaEvento creados o actualizados
- Si ya existe registro de asistencia, se actualiza
- Si no existe, se crea nuevo registro
- Registro de auditoría creado para cada operación

**Invariantes de Bucle:**
- Para cada elemento en attendances:
  - Se valida que personaId existe
  - Se crea o actualiza registro de asistencia
  - Todas las operaciones previas permanecen válidas

### Función 5: getAttendanceStatistics()

```typescript
async function getAttendanceStatistics(
  eventId: number,
  filters?: {ministerioId?: number, dateRange?: {start: Date, end: Date}}
): Promise<AttendanceStats>
```

**Precondiciones:**
- `eventId` corresponde a un evento existente (si se proporciona)
- Si se proporciona dateRange, start debe ser anterior a end

**Postcondiciones:**
- Retorna objeto con estadísticas de asistencia
- Incluye: total registrados, total asistieron, porcentaje asistencia
- Si se filtra por ministerio, solo incluye personas de ese ministerio
- Si se filtra por rango de fechas, solo incluye eventos en ese rango

**Invariantes de Bucle:**
- Al iterar sobre registros de asistencia:
  - Contador de asistencias válidas se incrementa correctamente
  - Porcentaje calculado es siempre entre 0 y 100

## Ejemplos de Uso

### Ejemplo 1: Autenticación y Uso de Token

```typescript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'admin',
    clave: 'password123'
  })
});

const { token, data } = await loginResponse.json();

// Usar token en solicitudes subsecuentes
const personasResponse = await fetch('http://localhost:3000/api/personas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const personas = await personasResponse.json();
```

### Ejemplo 2: Crear Persona con Validación

```typescript
// Crear nueva persona
const createPersonaResponse = await fetch('http://localhost:3000/api/personas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    primer_nombre: 'Juan',
    primer_apellido: 'Pérez',
    fecha_nacimiento: '1990-05-15',
    genero: 'M',
    identificacion: '1234567890',
    tipo_identificacion: 'CC',
    estado_civil: 'S',
    bautizado: true,
    fecha_bautizo: '2010-08-20',
    celular: '3001234567',
    email: 'juan.perez@example.com',
    direccion: 'Calle 123 #45-67'
  })
});

const persona = await createPersonaResponse.json();
```

### Ejemplo 3: Asignar Rol a Usuario

```typescript
// Asignar rol de "Pastor" a un usuario
const assignRoleResponse = await fetch(
  `http://localhost:3000/api/usuarios/${userId}/roles`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_rol: 2 // ID del rol "Pastor"
    })
  }
);

const usuarioRol = await assignRoleResponse.json();
```

### Ejemplo 4: Registrar Asistencia a Evento

```typescript
// Registrar asistencia múltiple a un evento
const attendanceResponse = await fetch(
  `http://localhost:3000/api/eventos/${eventId}/asistencia`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asistencias: [
        { id_persona: 1, asistio: true },
        { id_persona: 2, asistio: true },
        { id_persona: 3, asistio: false, observaciones: 'Enfermo' }
      ]
    })
  }
);

const asistencias = await attendanceResponse.json();
```

### Ejemplo 5: Consultar Auditoría

```typescript
// Obtener historial de cambios de una persona
const auditoriaResponse = await fetch(
  `http://localhost:3000/api/auditoria?tabla=PERSONAS&id_registro=1`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const historial = await auditoriaResponse.json();
```

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de corrección verificables por máquina.*

### Propiedad 1: Unicidad de Identificación de Personas

*Para cualquier* par de personas en el sistema, si tienen la misma identificación, entonces deben ser la misma persona (mismo id_persona).

**Valida: Requisitos 3.2**

### Propiedad 2: Integridad de Fechas de Bautizo

*Para cualquier* persona marcada como bautizada, la fecha de bautizo debe ser posterior o igual a la fecha de nacimiento.

**Valida: Requisitos 3.3**

### Propiedad 3: Consistencia de Roles y Permisos

*Para cualquier* usuario con roles asignados, los permisos efectivos del usuario deben incluir todos los permisos activos de todos sus roles activos sin duplicados.

**Valida: Requisitos 2.4, 4.9**

### Propiedad 4: Auditoría Completa de Operaciones

*Para cualquier* operación de creación, actualización o eliminación en el sistema, debe existir un registro de auditoría correspondiente con la acción, tabla, id de registro y datos apropiados.

**Valida: Requisitos 12.1, 12.2, 12.3**

### Propiedad 5: Unicidad de Usuario por Persona

*Para cualquier* persona en el sistema, puede existir a lo sumo un usuario asociado a esa persona.

**Valida: Requisitos 4.2**

### Propiedad 6: Integridad de Fechas de Eventos

*Para cualquier* evento con fecha de fin especificada, la fecha de fin debe ser posterior o igual a la fecha de inicio.

**Valida: Requisitos 9.2**

### Propiedad 7: Cabeza de Familia Única

*Para cualquier* familia en el sistema, debe existir exactamente una persona marcada como cabeza de familia.

**Valida: Requisitos 7.4, 7.5**

### Propiedad 8: Tokens JWT Válidos Contienen Información Completa

*Para cualquier* token JWT generado exitosamente, el payload debe contener userId, personaId, username, roles y permisos del usuario.

**Valida: Requisitos 1.4**

### Propiedad 9: Contraseñas Hasheadas con Bcrypt

*Para cualquier* usuario creado o actualizado, la contraseña almacenada debe ser un hash bcrypt válido con factor de costo mínimo de 10, nunca texto plano.

**Valida: Requisitos 1.7, 4.5**

### Propiedad 10: Eliminación Lógica de Registros Principales

*Para cualquier* operación de eliminación en entidades principales (personas, usuarios, roles, ministerios, familias, eventos), el registro debe permanecer en la base de datos con estado establecido a false.

**Valida: Requisitos 3.8, 6.6, 9.7, 19.3**

### Propiedad 11: Paginación con Límite Máximo

*Para cualquier* consulta de lista de recursos, el número de registros retornados debe ser menor o igual a 100, independientemente del límite solicitado.

**Valida: Requisitos 3.9, 15.4**

### Propiedad 12: Metadata de Paginación Consistente

*Para cualquier* respuesta paginada, la metadata debe incluir total, page, limit, totalPages (calculado como ceil(total/limit)), hasNextPage y hasPrevPage con valores correctos.

**Valida: Requisitos 15.5, 15.6**

### Propiedad 13: Unicidad de Nombres de Usuarios

*Para cualquier* par de usuarios en el sistema, si tienen el mismo nombre de usuario, entonces deben ser el mismo usuario (mismo id_usuario).

**Valida: Requisitos 4.1**

### Propiedad 14: Unicidad de Nombres de Roles

*Para cualquier* par de roles en el sistema, si tienen el mismo nombre, entonces deben ser el mismo rol (mismo id_rol).

**Valida: Requisitos 5.1**

### Propiedad 15: Unicidad de Nombres de Permisos

*Para cualquier* par de permisos en el sistema, si tienen el mismo nombre, entonces deben ser el mismo permiso (mismo id_permiso).

**Valida: Requisitos 5.2**

### Propiedad 16: Formato de Nombres de Permisos

*Para cualquier* permiso en el sistema, el nombre debe seguir el formato MODULO_ACCION (por ejemplo: PERSONAS_CREATE, EVENTOS_READ).

**Valida: Requisitos 5.6**

### Propiedad 17: Unicidad de Asistencia por Evento y Persona

*Para cualquier* par de registros de asistencia, si tienen el mismo id_evento e id_persona, entonces deben ser el mismo registro de asistencia.

**Valida: Requisitos 10.4**

### Propiedad 18: Contacto Principal Único por Tipo

*Para cualquier* persona y tipo de contacto, puede existir a lo sumo un contacto marcado como principal de ese tipo.

**Valida: Requisitos 8.4**

### Propiedad 19: Validación de Referencias Foráneas

*Para cualquier* registro con claves foráneas, todas las referencias deben apuntar a registros existentes en las tablas correspondientes.

**Valida: Requisitos 19.2, 19.5**

### Propiedad 20: Códigos HTTP Apropiados para Errores

*Para cualquier* error de validación, autenticación, autorización, recurso no encontrado o conflicto, el sistema debe retornar el código HTTP apropiado (400, 401, 403, 404, 409 respectivamente).

**Valida: Requisitos 14.1, 14.2, 14.3, 14.4, 14.5**

### Propiedad 21: Respuestas de API sin Contraseñas

*Para cualquier* respuesta de la API que incluya información de usuario, el hash de contraseña nunca debe estar presente en el payload de respuesta.

**Valida: Requisitos 4.6**

### Propiedad 22: Actualización de Último Acceso en Login

*Para cualquier* autenticación exitosa, el campo ultimo_acceso del usuario debe actualizarse a la fecha y hora actual.

**Valida: Requisitos 1.5**

### Propiedad 23: Filtrado de Registros Activos

*Para cualquier* consulta de roles de usuario, miembros de ministerio, contactos o permisos por módulo, solo deben retornarse registros con estado activo (estado = true).

**Valida: Requisitos 4.8, 5.5, 6.4, 8.6**

### Propiedad 24: Validación de Longitud Mínima de Credenciales

*Para cualquier* usuario creado, el nombre de usuario debe tener mínimo 4 caracteres y la contraseña mínimo 8 caracteres antes de hashear.

**Valida: Requisitos 4.3, 4.4**

### Propiedad 25: Cálculo Correcto de Estadísticas de Asistencia

*Para cualquier* evento con registros de asistencia, el porcentaje de asistencia calculado debe ser igual a (total_asistieron / total_registros) * 100.

**Valida: Requisitos 11.1, 11.2**

## Manejo de Errores

### Escenario 1: Credenciales Inválidas

**Condición**: Usuario intenta autenticarse con credenciales incorrectas

**Respuesta**: 
- Código HTTP: 401 Unauthorized
- Mensaje: "Credenciales inválidas"
- No revelar si el usuario existe o si la contraseña es incorrecta (seguridad)

**Recuperación**: Usuario debe intentar nuevamente con credenciales correctas

### Escenario 2: Token JWT Expirado

**Condición**: Cliente envía token JWT que ha expirado

**Respuesta**:
- Código HTTP: 401 Unauthorized
- Mensaje: "Token expirado"
- Header: "WWW-Authenticate: Bearer error='invalid_token'"

**Recuperación**: Cliente debe solicitar nuevo token mediante refresh token o re-autenticación

### Escenario 3: Permisos Insuficientes

**Condición**: Usuario autenticado intenta acceder a recurso sin permisos necesarios

**Respuesta**:
- Código HTTP: 403 Forbidden
- Mensaje: "No tiene permisos para realizar esta acción"
- Incluir permiso requerido en respuesta (para debugging)

**Recuperación**: Usuario debe solicitar permisos al administrador

### Escenario 4: Recurso No Encontrado

**Condición**: Se solicita un recurso con ID que no existe

**Respuesta**:
- Código HTTP: 404 Not Found
- Mensaje: "Recurso no encontrado"
- Incluir tipo de recurso y ID solicitado

**Recuperación**: Cliente debe verificar el ID del recurso

### Escenario 5: Violación de Unicidad

**Condición**: Se intenta crear/actualizar registro con valor único duplicado

**Respuesta**:
- Código HTTP: 409 Conflict
- Mensaje: "Ya existe un registro con ese valor"
- Incluir campo que viola la restricción

**Recuperación**: Usuario debe proporcionar valor único diferente

### Escenario 6: Validación de Datos Fallida

**Condición**: Datos enviados no cumplen con las reglas de validación

**Respuesta**:
- Código HTTP: 400 Bad Request
- Mensaje: "Error de validación"
- Array de errores con campo y mensaje específico

**Recuperación**: Cliente debe corregir los datos y reenviar

**Ejemplo de respuesta**:
```json
{
  "success": false,
  "error": "Error de validación",
  "details": [
    {
      "field": "email",
      "message": "Formato de email inválido"
    },
    {
      "field": "fecha_nacimiento",
      "message": "Debe ser una fecha en el pasado"
    }
  ]
}
```

### Escenario 7: Error de Base de Datos

**Condición**: Error al ejecutar operación en la base de datos

**Respuesta**:
- Código HTTP: 500 Internal Server Error
- Mensaje: "Error interno del servidor"
- No exponer detalles técnicos al cliente
- Registrar error completo en logs del servidor

**Recuperación**: 
- Sistema registra error en logs
- Cliente puede reintentar la operación
- Administrador debe revisar logs

### Escenario 8: Violación de Integridad Referencial

**Condición**: Se intenta eliminar registro referenciado por otros registros

**Respuesta**:
- Código HTTP: 409 Conflict
- Mensaje: "No se puede eliminar el registro porque está siendo utilizado"
- Incluir información sobre referencias existentes

**Recuperación**: Usuario debe eliminar primero las referencias o usar eliminación lógica (estado = false)

## Estrategia de Testing

### Enfoque de Testing Unitario

**Objetivo**: Probar funciones individuales de servicios y utilidades

**Herramientas**: Jest, ts-jest

**Cobertura esperada**: Mínimo 80% de cobertura de código

**Casos de prueba clave**:

1. **Auth Service**:
   - Login exitoso con credenciales válidas
   - Login fallido con credenciales inválidas
   - Login fallido con usuario inactivo
   - Generación correcta de token JWT
   - Verificación de token válido
   - Rechazo de token expirado
   - Rechazo de token malformado

2. **Personas Service**:
   - Crear persona con datos válidos
   - Rechazar persona con identificación duplicada
   - Rechazar persona con fecha_bautizo anterior a fecha_nacimiento
   - Actualizar persona existente
   - Eliminar persona (soft delete)
   - Buscar persona por identificación
   - Buscar persona por nombre

3. **Roles y Permisos Service**:
   - Asignar rol a usuario
   - Remover rol de usuario
   - Verificar permisos de usuario
   - Asignar permiso a rol
   - Obtener todos los permisos de un usuario a través de sus roles

4. **Validation Middleware**:
   - Validar datos correctos
   - Rechazar datos con campos faltantes
   - Rechazar datos con formato inválido
   - Validar tipos de datos correctos

5. **Authorization Middleware**:
   - Permitir acceso con permisos correctos
   - Denegar acceso sin permisos
   - Denegar acceso sin token
   - Denegar acceso con token inválido

### Enfoque de Testing Basado en Propiedades

**Objetivo**: Verificar propiedades invariantes del sistema con datos generados aleatoriamente

**Herramienta**: fast-check (para JavaScript/TypeScript)

**Propiedades a probar**:

1. **Propiedad: Idempotencia de Consultas GET**
```typescript
// Realizar la misma consulta GET dos veces debe retornar el mismo resultado
property('GET requests are idempotent', async () => {
  const result1 = await personasService.getById(personaId);
  const result2 = await personasService.getById(personaId);
  return deepEqual(result1, result2);
});
```

2. **Propiedad: Reversibilidad de Operaciones**
```typescript
// Crear y luego eliminar una persona debe dejar el sistema en estado consistente
property('Create and delete are reversible', async () => {
  const initialCount = await personasService.count();
  const persona = await personasService.create(validPersonaData);
  await personasService.delete(persona.id_persona);
  const finalCount = await personasService.count();
  return initialCount === finalCount;
});
```

3. **Propiedad: Consistencia de Paginación**
```typescript
// La suma de todos los registros paginados debe igual al total
property('Pagination consistency', async () => {
  const allPages = await getAllPages(personasService);
  const directCount = await personasService.count();
  return allPages.length === directCount;
});
```

4. **Propiedad: Unicidad de Identificación**
```typescript
// No pueden existir dos personas con la misma identificación
property('Identification uniqueness', async () => {
  const personas = await personasService.getAll();
  const identificaciones = personas.map(p => p.identificacion);
  const uniqueIds = new Set(identificaciones);
  return identificaciones.length === uniqueIds.size;
});
```

5. **Propiedad: Integridad de Auditoría**
```typescript
// Toda operación de modificación debe generar registro de auditoría
property('Audit trail completeness', async () => {
  const persona = await personasService.create(validPersonaData);
  const auditRecords = await auditoriaService.getByRecord('PERSONAS', persona.id_persona);
  return auditRecords.length > 0 && auditRecords[0].accion === 'INSERT';
});
```

### Enfoque de Testing de Integración

**Objetivo**: Probar la interacción entre componentes y con la base de datos

**Herramientas**: Jest, Supertest, base de datos de prueba PostgreSQL

**Configuración**:
- Base de datos PostgreSQL dedicada para tests
- Datos de prueba cargados antes de cada suite
- Limpieza de datos después de cada test

**Casos de prueba clave**:

1. **Flujo Completo de Autenticación**:
   - Crear usuario → Login → Acceder a recurso protegido → Logout
   - Verificar que el token funciona correctamente en toda la cadena

2. **Flujo de Gestión de Personas**:
   - Crear persona → Crear usuario para esa persona → Asignar rol → Verificar permisos
   - Probar cascada de eliminación

3. **Flujo de Eventos y Asistencia**:
   - Crear evento → Registrar múltiples asistencias → Consultar estadísticas
   - Verificar cálculos de estadísticas

4. **Flujo de Ministerios**:
   - Crear ministerio → Asignar líder → Agregar miembros → Consultar miembros activos
   - Verificar relaciones correctas

5. **Flujo de Auditoría**:
   - Realizar operaciones CRUD → Verificar registros de auditoría
   - Consultar historial de cambios de un registro

**Ejemplo de test de integración**:
```typescript
describe('Integration: Auth Flow', () => {
  it('should complete full authentication flow', async () => {
    // 1. Crear persona
    const persona = await request(app)
      .post('/api/personas')
      .send(validPersonaData)
      .expect(201);
    
    // 2. Crear usuario
    const usuario = await request(app)
      .post('/api/usuarios')
      .send({
        id_persona: persona.body.data.id_persona,
        usuario: 'testuser',
        clave: 'password123'
      })
      .expect(201);
    
    // 3. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'testuser',
        clave: 'password123'
      })
      .expect(200);
    
    const { token } = loginResponse.body;
    
    // 4. Acceder a recurso protegido
    await request(app)
      .get('/api/personas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

## Consideraciones de Rendimiento

### Optimización de Consultas

1. **Índices de Base de Datos**:
   - Todos los índices definidos en el schema SQL deben mantenerse
   - Índices en campos de búsqueda frecuente: identificacion, nombres, usuario
   - Índices en claves foráneas para joins eficientes

2. **Paginación Obligatoria**:
   - Todas las consultas que retornan listas deben estar paginadas
   - Límite máximo de 100 registros por página
   - Límite por defecto de 10 registros

3. **Eager Loading Selectivo**:
   - Usar `include` de Prisma solo cuando sea necesario
   - Evitar N+1 queries usando `include` apropiadamente
   - Ejemplo: Al obtener usuarios, incluir persona y roles en una sola query

4. **Caché de Permisos**:
   - Cachear permisos de usuario en el token JWT
   - Evitar consultar permisos en cada request
   - Invalidar caché al cambiar roles/permisos del usuario

5. **Consultas Optimizadas para Estadísticas**:
   - Usar agregaciones de base de datos (COUNT, SUM, AVG)
   - Evitar traer todos los registros a memoria para calcular estadísticas
   - Ejemplo: Estadísticas de asistencia calculadas con SQL agregado

### Límites de Rate Limiting

- Implementar rate limiting por IP y por usuario
- Límite general: 100 requests por minuto por IP
- Límite de login: 5 intentos por minuto por IP
- Usar express-rate-limit middleware

### Compresión de Respuestas

- Habilitar compresión gzip para respuestas HTTP
- Usar compression middleware de Express
- Reducir tamaño de payloads JSON grandes

## Consideraciones de Seguridad

### Autenticación

1. **Hashing de Contraseñas**:
   - Usar bcrypt con factor de costo mínimo de 10
   - Nunca almacenar contraseñas en texto plano
   - Nunca retornar hash de contraseña en respuestas API

2. **Tokens JWT**:
   - Usar algoritmo HS256 o RS256
   - Tiempo de expiración: 8 horas
   - Incluir solo información necesaria en payload
   - Validar token en cada request protegido

3. **Refresh Tokens**:
   - Implementar refresh tokens con mayor duración (7 días)
   - Almacenar refresh tokens en base de datos
   - Permitir revocación de refresh tokens

### Autorización

1. **Control de Acceso Basado en Roles (RBAC)**:
   - Verificar permisos en cada endpoint protegido
   - Usar middleware de autorización consistentemente
   - Principio de menor privilegio

2. **Validación de Propiedad de Recursos**:
   - Verificar que el usuario tiene derecho a modificar el recurso
   - No confiar solo en el ID proporcionado por el cliente

### Validación de Entrada

1. **Sanitización de Datos**:
   - Validar y sanitizar todas las entradas del usuario
   - Usar bibliotecas de validación (Zod, Joi, class-validator)
   - Rechazar datos que no cumplan el schema

2. **Prevención de Inyección SQL**:
   - Usar Prisma ORM que previene inyección SQL
   - Nunca construir queries SQL con concatenación de strings
   - Usar prepared statements si se requiere SQL raw

3. **Prevención de XSS**:
   - Escapar datos antes de retornarlos
   - Usar Content-Security-Policy headers
   - Validar y sanitizar campos de texto libre

### Headers de Seguridad

Implementar headers de seguridad usando helmet:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'

### Protección contra Ataques

1. **Rate Limiting**:
   - Limitar intentos de login
   - Limitar requests por IP
   - Implementar backoff exponencial

2. **CORS**:
   - Configurar CORS apropiadamente
   - Permitir solo orígenes confiables
   - No usar wildcard (*) en producción

3. **Logging de Seguridad**:
   - Registrar intentos de login fallidos
   - Registrar accesos denegados
   - Registrar cambios en permisos y roles
   - No registrar información sensible (contraseñas, tokens)

4. **Protección de Datos Sensibles**:
   - Usar HTTPS en producción
   - Encriptar datos sensibles en base de datos si es necesario
   - No exponer información sensible en logs o mensajes de error

## Dependencias

### Dependencias de Producción

```json
{
  "express": "^4.18.2",
  "typescript": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "compression": "^1.7.4",
  "zod": "^3.21.4",
  "winston": "^3.8.2",
  "swagger-ui-express": "^4.6.3",
  "swagger-jsdoc": "^6.2.8"
}
```

### Dependencias de Desarrollo

```json
{
  "@types/express": "^4.17.17",
  "@types/node": "^20.0.0",
  "@types/bcrypt": "^5.0.0",
  "@types/jsonwebtoken": "^9.0.2",
  "@types/cors": "^2.8.13",
  "@types/compression": "^1.7.2",
  "@types/swagger-ui-express": "^4.1.3",
  "@types/swagger-jsdoc": "^6.0.1",
  "prisma": "^5.0.0",
  "ts-node": "^10.9.1",
  "ts-node-dev": "^2.0.0",
  "jest": "^29.5.0",
  "ts-jest": "^29.1.0",
  "@types/jest": "^29.5.0",
  "supertest": "^6.3.3",
  "@types/supertest": "^2.0.12",
  "fast-check": "^3.10.0",
  "eslint": "^8.40.0",
  "@typescript-eslint/eslint-plugin": "^5.59.0",
  "@typescript-eslint/parser": "^5.59.0",
  "prettier": "^2.8.8"
}
```

### Servicios Externos

- **PostgreSQL**: Base de datos principal (versión 14 o superior)
- **Redis** (opcional): Para caché y sesiones
- **SMTP Server** (opcional): Para envío de emails de notificación

## Estructura de Endpoints API

### Módulo: Autenticación

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| POST | /api/auth/login | Iniciar sesión | Público |
| POST | /api/auth/logout | Cerrar sesión | Autenticado |
| POST | /api/auth/refresh | Refrescar token | Autenticado |
| GET | /api/auth/me | Obtener usuario actual | Autenticado |
| PUT | /api/auth/change-password | Cambiar contraseña | Autenticado |

### Módulo: Personas

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/personas | Listar personas (paginado) | PERSONAS_READ |
| GET | /api/personas/:id | Obtener persona por ID | PERSONAS_READ |
| GET | /api/personas/identificacion/:id | Buscar por identificación | PERSONAS_READ |
| GET | /api/personas/search | Buscar personas | PERSONAS_READ |
| POST | /api/personas | Crear persona | PERSONAS_CREATE |
| PUT | /api/personas/:id | Actualizar persona | PERSONAS_UPDATE |
| DELETE | /api/personas/:id | Eliminar persona | PERSONAS_DELETE |

### Módulo: Usuarios

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/usuarios | Listar usuarios | USUARIOS_READ |
| GET | /api/usuarios/:id | Obtener usuario por ID | USUARIOS_READ |
| POST | /api/usuarios | Crear usuario | USUARIOS_CREATE |
| PUT | /api/usuarios/:id | Actualizar usuario | USUARIOS_UPDATE |
| DELETE | /api/usuarios/:id | Eliminar usuario | USUARIOS_DELETE |
| POST | /api/usuarios/:id/roles | Asignar rol | USUARIOS_ASSIGN_ROLE |
| DELETE | /api/usuarios/:id/roles/:roleId | Remover rol | USUARIOS_REMOVE_ROLE |
| GET | /api/usuarios/:id/roles | Obtener roles | USUARIOS_READ |
| GET | /api/usuarios/:id/permisos | Obtener permisos | USUARIOS_READ |

### Módulo: Roles

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/roles | Listar roles | ROLES_READ |
| GET | /api/roles/:id | Obtener rol por ID | ROLES_READ |
| POST | /api/roles | Crear rol | ROLES_CREATE |
| PUT | /api/roles/:id | Actualizar rol | ROLES_UPDATE |
| DELETE | /api/roles/:id | Eliminar rol | ROLES_DELETE |
| POST | /api/roles/:id/permisos | Asignar permiso | ROLES_ASSIGN_PERMISSION |
| DELETE | /api/roles/:id/permisos/:permisoId | Remover permiso | ROLES_REMOVE_PERMISSION |
| GET | /api/roles/:id/permisos | Obtener permisos del rol | ROLES_READ |

### Módulo: Permisos

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/permisos | Listar permisos | PERMISOS_READ |
| GET | /api/permisos/:id | Obtener permiso por ID | PERMISOS_READ |
| GET | /api/permisos/modulo/:modulo | Obtener por módulo | PERMISOS_READ |
| POST | /api/permisos | Crear permiso | PERMISOS_CREATE |
| PUT | /api/permisos/:id | Actualizar permiso | PERMISOS_UPDATE |
| DELETE | /api/permisos/:id | Eliminar permiso | PERMISOS_DELETE |

### Módulo: Ministerios

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/ministerios | Listar ministerios | MINISTERIOS_READ |
| GET | /api/ministerios/:id | Obtener ministerio por ID | MINISTERIOS_READ |
| POST | /api/ministerios | Crear ministerio | MINISTERIOS_CREATE |
| PUT | /api/ministerios/:id | Actualizar ministerio | MINISTERIOS_UPDATE |
| DELETE | /api/ministerios/:id | Eliminar ministerio | MINISTERIOS_DELETE |
| POST | /api/ministerios/:id/miembros | Asignar persona | MINISTERIOS_ASSIGN_MEMBER |
| DELETE | /api/ministerios/:id/miembros/:personaId | Remover persona | MINISTERIOS_REMOVE_MEMBER |
| GET | /api/ministerios/:id/miembros | Obtener miembros | MINISTERIOS_READ |
| PUT | /api/ministerios/:id/miembros/:personaId | Actualizar cargo | MINISTERIOS_UPDATE_MEMBER |

### Módulo: Familias

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/familias | Listar familias | FAMILIAS_READ |
| GET | /api/familias/:id | Obtener familia por ID | FAMILIAS_READ |
| POST | /api/familias | Crear familia | FAMILIAS_CREATE |
| PUT | /api/familias/:id | Actualizar familia | FAMILIAS_UPDATE |
| DELETE | /api/familias/:id | Eliminar familia | FAMILIAS_DELETE |
| POST | /api/familias/:id/miembros | Agregar miembro | FAMILIAS_ADD_MEMBER |
| DELETE | /api/familias/:id/miembros/:personaId | Remover miembro | FAMILIAS_REMOVE_MEMBER |
| GET | /api/familias/:id/miembros | Obtener miembros | FAMILIAS_READ |
| PUT | /api/familias/:id/miembros/:personaId | Actualizar parentesco | FAMILIAS_UPDATE_MEMBER |

### Módulo: Contactos

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/contactos/persona/:personaId | Listar contactos de persona | CONTACTOS_READ |
| GET | /api/contactos/:id | Obtener contacto por ID | CONTACTOS_READ |
| POST | /api/contactos | Crear contacto | CONTACTOS_CREATE |
| PUT | /api/contactos/:id | Actualizar contacto | CONTACTOS_UPDATE |
| DELETE | /api/contactos/:id | Eliminar contacto | CONTACTOS_DELETE |
| PUT | /api/contactos/:id/principal | Marcar como principal | CONTACTOS_UPDATE |

### Módulo: Eventos

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/eventos | Listar eventos | EVENTOS_READ |
| GET | /api/eventos/:id | Obtener evento por ID | EVENTOS_READ |
| GET | /api/eventos/fecha | Filtrar por rango de fechas | EVENTOS_READ |
| GET | /api/eventos/ministerio/:id | Filtrar por ministerio | EVENTOS_READ |
| POST | /api/eventos | Crear evento | EVENTOS_CREATE |
| PUT | /api/eventos/:id | Actualizar evento | EVENTOS_UPDATE |
| DELETE | /api/eventos/:id | Eliminar evento | EVENTOS_DELETE |
| POST | /api/eventos/:id/asistencia | Registrar asistencias | EVENTOS_REGISTER_ATTENDANCE |
| GET | /api/eventos/:id/asistencia | Obtener asistencias | EVENTOS_READ |
| GET | /api/eventos/:id/estadisticas | Obtener estadísticas | EVENTOS_READ |

### Módulo: Auditoría

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | /api/auditoria | Listar registros de auditoría | AUDITORIA_READ |
| GET | /api/auditoria/tabla/:tabla | Filtrar por tabla | AUDITORIA_READ |
| GET | /api/auditoria/usuario/:userId | Filtrar por usuario | AUDITORIA_READ |
| GET | /api/auditoria/fecha | Filtrar por rango de fechas | AUDITORIA_READ |
| GET | /api/auditoria/registro/:tabla/:id | Historial de un registro | AUDITORIA_READ |

## Esquemas de Validación

### Schema: CreatePersonaDTO

```typescript
import { z } from 'zod';

export const CreatePersonaSchema = z.object({
  primer_nombre: z.string().min(1).max(50),
  segundo_nombre: z.string().max(50).optional(),
  tercer_nombre: z.string().max(50).optional(),
  primer_apellido: z.string().min(1).max(50),
  segundo_apellido: z.string().max(50).optional(),
  fecha_nacimiento: z.string().datetime().or(z.date()),
  genero: z.enum(['M', 'F']),
  bautizado: z.boolean().default(false),
  fecha_bautizo: z.string().datetime().or(z.date()).optional(),
  identificacion: z.string().min(1).max(20),
  tipo_identificacion: z.enum(['CC', 'TI', 'CE', 'PAS', 'RC']),
  estado_civil: z.enum(['S', 'C', 'V', 'D', 'U']),
  celular: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  direccion: z.string().optional()
}).refine(
  (data) => {
    if (data.bautizado && data.fecha_bautizo) {
      return new Date(data.fecha_bautizo) >= new Date(data.fecha_nacimiento);
    }
    return true;
  },
  {
    message: 'fecha_bautizo debe ser posterior a fecha_nacimiento',
    path: ['fecha_bautizo']
  }
);

export type CreatePersonaDTO = z.infer<typeof CreatePersonaSchema>;
```

### Schema: CreateUsuarioDTO

```typescript
export const CreateUsuarioSchema = z.object({
  id_persona: z.number().int().positive(),
  usuario: z.string().min(4).max(50),
  clave: z.string().min(8).max(100)
});

export type CreateUsuarioDTO = z.infer<typeof CreateUsuarioSchema>;
```

### Schema: LoginDTO

```typescript
export const LoginSchema = z.object({
  usuario: z.string().min(1),
  clave: z.string().min(1)
});

export type LoginDTO = z.infer<typeof LoginSchema>;
```

### Schema: CreateEventoDTO

```typescript
export const CreateEventoSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  tipo_evento: z.enum(['CULTO', 'REUNION', 'CONFERENCIA', 'RETIRO', 'SERVICIO', 'OTRO']).optional(),
  fecha_inicio: z.string().datetime().or(z.date()),
  fecha_fin: z.string().datetime().or(z.date()).optional(),
  lugar: z.string().max(200).optional(),
  id_ministerio: z.number().int().positive().optional()
}).refine(
  (data) => {
    if (data.fecha_fin) {
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
  },
  {
    message: 'fecha_fin debe ser posterior a fecha_inicio',
    path: ['fecha_fin']
  }
);

export type CreateEventoDTO = z.infer<typeof CreateEventoSchema>;
```

### Schema: RegisterAttendanceDTO

```typescript
export const RegisterAttendanceSchema = z.object({
  asistencias: z.array(
    z.object({
      id_persona: z.number().int().positive(),
      asistio: z.boolean(),
      observaciones: z.string().optional()
    })
  ).min(1)
});

export type RegisterAttendanceDTO = z.infer<typeof RegisterAttendanceSchema>;
```

## Ejemplos de Implementación de Código

### Ejemplo: Auth Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

interface JWTPayload {
  userId: number;
  personaId: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    // Validar que el usuario sigue activo
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.userId }
    });

    if (!user || !user.estado) {
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo o no encontrado'
      });
    }

    // Agregar información del usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};
```

### Ejemplo: Authorization Middleware

```typescript
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado'
        });
      }

      // Verificar si el usuario tiene el permiso
      if (!user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para realizar esta acción',
          requiredPermission: permission
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

// Uso en rutas:
// router.get('/personas', authMiddleware, requirePermission('PERSONAS_READ'), personasController.getAll);
```

### Ejemplo: Validation Middleware

```typescript
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
};

// Uso en rutas:
// router.post('/personas', authMiddleware, validate(CreatePersonaSchema), personasController.create);
```

### Ejemplo: Error Handler Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

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
    method: req.method
  });

  // Error de Prisma - Violación de unicidad
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un registro con ese valor',
        field: error.meta?.target
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }
  }

  // Error de validación personalizado
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Error de autorización personalizado
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
};
```

### Ejemplo: Personas Controller

```typescript
import { Request, Response, NextFunction } from 'express';
import { personasService } from '../services/personas.service';

export class PersonasController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado === 'false' ? false : true;

      const result = await personasService.getAll(page, limit, { estado });

      return res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const persona = await personasService.getById(id);

      if (!persona) {
        return res.status(404).json({
          success: false,
          error: 'Persona no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: persona
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const persona = await personasService.create(req.body, userId);

      return res.status(201).json({
        success: true,
        data: persona
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const persona = await personasService.update(id, req.body, userId);

      return res.status(200).json({
        success: true,
        data: persona
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      await personasService.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Persona eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const personasController = new PersonasController();
```

### Ejemplo: Personas Service

```typescript
import { prisma } from '../config/database';
import { CreatePersonaDTO, UpdatePersonaDTO } from '../validators/personas.validator';
import { auditoriaService } from './auditoria.service';

class PersonasService {
  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.personas.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { fecha_creacion: 'desc' }
      }),
      prisma.personas.count({ where: filters })
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  async getById(id: number) {
    return await prisma.personas.findUnique({
      where: { id_persona: id }
    });
  }

  async getByIdentificacion(identificacion: string) {
    return await prisma.personas.findUnique({
      where: { identificacion }
    });
  }

  async create(data: CreatePersonaDTO, userId?: number) {
    const persona = await prisma.personas.create({
      data: {
        ...data,
        usuario_modificacion: userId
      }
    });

    // Registrar en auditoría
    await auditoriaService.log(
      'PERSONAS',
      persona.id_persona,
      'INSERT',
      null,
      persona,
      userId
    );

    return persona;
  }

  async update(id: number, data: UpdatePersonaDTO, userId?: number) {
    // Obtener datos anteriores
    const oldData = await this.getById(id);
    
    if (!oldData) {
      throw new Error('Persona no encontrada');
    }

    const persona = await prisma.personas.update({
      where: { id_persona: id },
      data: {
        ...data,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId
      }
    });

    // Registrar en auditoría
    await auditoriaService.log(
      'PERSONAS',
      persona.id_persona,
      'UPDATE',
      oldData,
      persona,
      userId
    );

    return persona;
  }

  async delete(id: number, userId?: number) {
    // Obtener datos anteriores
    const oldData = await this.getById(id);
    
    if (!oldData) {
      throw new Error('Persona no encontrada');
    }

    // Soft delete
    await prisma.personas.update({
      where: { id_persona: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId
      }
    });

    // Registrar en auditoría
    await auditoriaService.log(
      'PERSONAS',
      id,
      'DELETE',
      oldData,
      null,
      userId
    );
  }
}

export const personasService = new PersonasService();
```

### Ejemplo: Personas Routes

```typescript
import { Router } from 'express';
import { personasController } from '../controllers/personas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreatePersonaSchema, UpdatePersonaSchema } from '../validators/personas.validator';

const router = Router();

/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Obtener lista de personas
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de personas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.getAll
);

router.get(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.getById
);

router.post(
  '/',
  authMiddleware,
  requirePermission('PERSONAS_CREATE'),
  validate(CreatePersonaSchema),
  personasController.create
);

router.put(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_UPDATE'),
  validate(UpdatePersonaSchema),
  personasController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_DELETE'),
  personasController.delete
);

export default router;
```

### Ejemplo: Prisma Schema (Parcial)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model personas {
  id_persona           Int       @id @default(autoincrement())
  primer_nombre        String    @db.VarChar(50)
  segundo_nombre       String?   @db.VarChar(50)
  tercer_nombre        String?   @db.VarChar(50)
  primer_apellido      String    @db.VarChar(50)
  segundo_apellido     String?   @db.VarChar(50)
  fecha_nacimiento     DateTime  @db.Date
  genero               String    @db.VarChar(1)
  bautizado            Boolean   @default(false)
  fecha_bautizo        DateTime? @db.Date
  identificacion       String    @unique @db.VarChar(20)
  tipo_identificacion  String    @db.VarChar(3)
  estado_civil         String    @db.VarChar(1)
  celular              String?   @db.VarChar(20)
  email                String?   @db.VarChar(100)
  direccion            String?
  estado               Boolean   @default(true)
  fecha_creacion       DateTime  @default(now())
  fecha_modificacion   DateTime?
  usuario_modificacion Int?

  usuarios             usuarios?
  ministerio_lider     ministerio[]        @relation("ministerio_lider")
  ministerio_persona   ministerio_persona[]
  familia_persona      familia_persona[]
  contactos            contactos[]
  asistencia_eventos   asistencia_eventos[]

  @@index([identificacion])
  @@index([primer_nombre, primer_apellido])
}

model usuarios {
  id_usuario           Int       @id @default(autoincrement())
  id_persona           Int       @unique
  usuario              String    @unique @db.VarChar(50)
  clave                String    @db.VarChar(255)
  estado               Boolean   @default(true)
  ultimo_acceso        DateTime?
  fecha_creacion       DateTime  @default(now())
  fecha_modificacion   DateTime?
  usuario_modificacion Int?

  persona              personas  @relation(fields: [id_persona], references: [id_persona], onDelete: Cascade)
  usuarios_roles       usuarios_roles[]
  auditoria            auditoria[]

  @@index([usuario])
  @@index([id_persona])
}

model roles {
  id_rol               Int       @id @default(autoincrement())
  nombre               String    @unique @db.VarChar(50)
  descripcion          String?
  estado               Boolean   @default(true)
  fecha_creacion       DateTime  @default(now())
  fecha_modificacion   DateTime?
  usuario_modificacion Int?

  usuarios_roles       usuarios_roles[]
  roles_permisos       roles_permisos[]
}
```

### Ejemplo: Variables de Entorno (.env.example)

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/micasa

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
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

### Ejemplo: Configuración de Swagger

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Gestión de Iglesia MICASA',
      version: '1.0.0',
      description: 'API RESTful para gestión integral de iglesia',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@micasa.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  if (process.env.SWAGGER_ENABLED === 'true') {
    app.use(
      process.env.SWAGGER_PATH || '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }'
      })
    );
  }
};
```

### Ejemplo: App.ts (Configuración de Express)

```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Middlewares de seguridad
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Demasiadas solicitudes desde esta IP'
  });
  app.use(limiter);

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compresión
  app.use(compression());

  // Swagger
  setupSwagger(app);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
  });

  // Routes
  app.use(process.env.API_PREFIX || '/api', routes);

  // Error handler (debe ser el último middleware)
  app.use(errorHandler);

  return app;
};
```

### Ejemplo: Server.ts (Punto de Entrada)

```typescript
import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verificar conexión a base de datos
    await prisma.$connect();
    logger.info('Conexión a base de datos establecida');

    // Crear y arrancar servidor
    const app = createApp();
    
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Documentación API: http://localhost:${PORT}/api-docs`);
    });

    // Manejo de señales de terminación
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recibido, cerrando servidor...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT recibido, cerrando servidor...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
```

## Configuración Inicial del Proyecto

### Comandos de Instalación

```bash
# Crear directorio del proyecto
mkdir micasa-backend
cd micasa-backend

# Inicializar proyecto Node.js
npm init -y

# Instalar dependencias de producción
npm install express typescript @prisma/client bcrypt jsonwebtoken dotenv cors helmet express-rate-limit compression zod winston swagger-ui-express swagger-jsdoc

# Instalar dependencias de desarrollo
npm install -D @types/express @types/node @types/bcrypt @types/jsonwebtoken @types/cors @types/compression @types/swagger-ui-express @types/swagger-jsdoc prisma ts-node ts-node-dev jest ts-jest @types/jest supertest @types/supertest fast-check eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier

# Inicializar Prisma
npx prisma init

# Inicializar TypeScript
npx tsc --init
```

### Scripts de package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Configuración de TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Pasos de Implementación Recomendados

### Fase 1: Configuración Base (Semana 1)
1. Inicializar proyecto Node.js con TypeScript
2. Configurar Prisma con el schema basado en el SQL
3. Configurar variables de entorno
4. Implementar estructura de carpetas
5. Configurar Express con middlewares básicos
6. Configurar Swagger para documentación

### Fase 2: Autenticación y Autorización (Semana 2)
1. Implementar modelo de usuarios en Prisma
2. Crear servicio de autenticación (login, JWT)
3. Implementar middleware de autenticación
4. Implementar middleware de autorización
5. Crear endpoints de autenticación
6. Implementar sistema de roles y permisos

### Fase 3: Módulos Core (Semanas 3-4)
1. Implementar CRUD de Personas
2. Implementar CRUD de Usuarios
3. Implementar gestión de Roles y Permisos
4. Implementar sistema de auditoría
5. Agregar validaciones con Zod
6. Implementar paginación

### Fase 4: Módulos de Gestión (Semanas 5-6)
1. Implementar CRUD de Ministerios
2. Implementar CRUD de Familias
3. Implementar CRUD de Contactos
4. Implementar CRUD de Eventos
5. Implementar registro de asistencias
6. Implementar estadísticas de asistencia

### Fase 5: Testing y Optimización (Semana 7)
1. Escribir tests unitarios para servicios
2. Escribir tests de integración para endpoints
3. Implementar tests basados en propiedades
4. Optimizar consultas de base de datos
5. Implementar caché donde sea necesario
6. Realizar pruebas de carga

### Fase 6: Documentación y Deployment (Semana 8)
1. Completar documentación de Swagger
2. Escribir README con instrucciones
3. Configurar CI/CD
4. Preparar scripts de deployment
5. Configurar monitoreo y logging
6. Realizar pruebas finales

## Notas Finales

Este diseño proporciona una base sólida para el backend del sistema MICASA. Los puntos clave incluyen:

- Arquitectura en capas clara (Controllers → Services → Prisma → DB)
- Seguridad robusta con JWT, bcrypt, y control de acceso basado en roles
- Validación exhaustiva de datos con Zod
- Auditoría completa de todas las operaciones
- Documentación automática con Swagger
- Testing comprehensivo (unitario, integración, basado en propiedades)
- Manejo centralizado de errores
- Paginación y optimización de consultas
- Código TypeScript tipado y mantenible

El sistema está diseñado para ser escalable, seguro y fácil de mantener, siguiendo las mejores prácticas de desarrollo de APIs RESTful con Node.js y Express.
