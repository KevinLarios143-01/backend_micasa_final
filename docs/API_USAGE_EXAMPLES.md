# Ejemplos de Uso de la API MICASA

Esta guía proporciona ejemplos prácticos de cómo usar cada endpoint de la API MICASA.

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Personas](#personas)
- [Usuarios](#usuarios)
- [Roles y Permisos](#roles-y-permisos)
- [Ministerios](#ministerios)
- [Familias](#familias)
- [Contactos](#contactos)
- [Eventos y Asistencias](#eventos-y-asistencias)
- [Auditoría](#auditoría)

## Configuración Base

Todas las peticiones (excepto login) requieren el token JWT en el header:

```
Authorization: Bearer <tu_token_jwt>
```

Base URL: `http://localhost:3000/api`

## Autenticación

### Login

Obtener token de autenticación con credenciales de usuario.

**Endpoint:** `POST /auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin",
    "clave": "Admin123!"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id_usuario": 1,
      "usuario": "admin",
      "persona": {
        "id_persona": 1,
        "primer_nombre": "Administrador",
        "primer_apellido": "Sistema"
      },
      "roles": ["Administrador"],
      "permissions": ["PERSONAS_CREATE", "PERSONAS_READ", "PERSONAS_UPDATE", "PERSONAS_DELETE", ...]
    }
  }
}
```

### Obtener Usuario Actual

**Endpoint:** `GET /auth/me`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "usuario": "admin",
    "persona": {
      "primer_nombre": "Administrador",
      "primer_apellido": "Sistema"
    },
    "roles": ["Administrador"]
  }
}
```

### Cambiar Contraseña

**Endpoint:** `PUT /auth/change-password`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "claveActual": "Admin123!",
    "claveNueva": "NuevaPassword456!"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

## Personas

### Listar Personas (con paginación)

**Endpoint:** `GET /personas?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/personas?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_persona": 1,
      "primer_nombre": "Juan",
      "segundo_nombre": "Carlos",
      "primer_apellido": "Pérez",
      "segundo_apellido": "García",
      "identificacion": "1234567890",
      "tipo_identificacion": "CC",
      "genero": "M",
      "fecha_nacimiento": "1990-05-15T00:00:00.000Z",
      "estado_civil": "C",
      "bautizado": true,
      "fecha_bautizo": "2010-08-20T00:00:00.000Z",
      "celular": "3001234567",
      "email": "juan.perez@example.com",
      "direccion": "Calle 123 #45-67",
      "estado": true
    }
  ],
  "metadata": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Obtener Persona por ID

**Endpoint:** `GET /personas/:id`

**Request:**
```bash
curl -X GET http://localhost:3000/api/personas/1 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_persona": 1,
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "identificacion": "1234567890",
    "tipo_identificacion": "CC",
    "genero": "M",
    "fecha_nacimiento": "1990-05-15T00:00:00.000Z",
    "estado_civil": "C",
    "bautizado": true,
    "celular": "3001234567",
    "email": "juan.perez@example.com"
  }
}
```

### Buscar Persona por Identificación

**Endpoint:** `GET /personas/identificacion/:identificacion`

**Request:**
```bash
curl -X GET http://localhost:3000/api/personas/identificacion/1234567890 \
  -H "Authorization: Bearer <token>"
```

### Buscar Personas por Nombre

**Endpoint:** `GET /personas/search?q=Juan`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/personas/search?q=Juan" \
  -H "Authorization: Bearer <token>"
```

### Crear Persona

**Endpoint:** `POST /personas`

**Request:**
```bash
curl -X POST http://localhost:3000/api/personas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "primer_nombre": "María",
    "segundo_nombre": "Elena",
    "primer_apellido": "González",
    "segundo_apellido": "López",
    "identificacion": "9876543210",
    "tipo_identificacion": "CC",
    "genero": "F",
    "fecha_nacimiento": "1995-03-20",
    "estado_civil": "S",
    "bautizado": false,
    "celular": "3109876543",
    "email": "maria.gonzalez@example.com",
    "direccion": "Carrera 45 #12-34"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id_persona": 2,
    "primer_nombre": "María",
    "primer_apellido": "González",
    "identificacion": "9876543210",
    "estado": true,
    "fecha_creacion": "2024-01-15T10:30:00.000Z"
  }
}
```

### Actualizar Persona

**Endpoint:** `PUT /personas/:id`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/personas/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "celular": "3209876543",
    "direccion": "Nueva Dirección 123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_persona": 2,
    "primer_nombre": "María",
    "celular": "3209876543",
    "direccion": "Nueva Dirección 123",
    "fecha_modificacion": "2024-01-15T11:00:00.000Z"
  }
}
```

### Eliminar Persona (Soft Delete)

**Endpoint:** `DELETE /personas/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/personas/2 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Persona eliminada exitosamente"
}
```

## Usuarios

### Listar Usuarios

**Endpoint:** `GET /usuarios?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/usuarios?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Crear Usuario

**Endpoint:** `POST /usuarios`

**Request:**
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_persona": 2,
    "usuario": "mgonzalez",
    "clave": "Password123!"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 2,
    "id_persona": 2,
    "usuario": "mgonzalez",
    "estado": true,
    "fecha_creacion": "2024-01-15T10:45:00.000Z"
  }
}
```

### Asignar Rol a Usuario

**Endpoint:** `POST /usuarios/:id/roles`

**Request:**
```bash
curl -X POST http://localhost:3000/api/usuarios/2/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_rol": 2
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol asignado exitosamente"
}
```

### Obtener Roles de Usuario

**Endpoint:** `GET /usuarios/:id/roles`

**Request:**
```bash
curl -X GET http://localhost:3000/api/usuarios/2/roles \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_rol": 2,
      "nombre": "Líder de Ministerio",
      "descripcion": "Puede gestionar su ministerio"
    }
  ]
}
```

### Obtener Permisos de Usuario

**Endpoint:** `GET /usuarios/:id/permisos`

**Request:**
```bash
curl -X GET http://localhost:3000/api/usuarios/2/permisos \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "MINISTERIOS_READ",
    "MINISTERIOS_UPDATE",
    "EVENTOS_CREATE",
    "EVENTOS_READ"
  ]
}
```

### Remover Rol de Usuario

**Endpoint:** `DELETE /usuarios/:id/roles/:roleId`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/usuarios/2/roles/2 \
  -H "Authorization: Bearer <token>"
```

## Roles y Permisos

### Listar Roles

**Endpoint:** `GET /roles`

**Request:**
```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer <token>"
```

### Crear Rol

**Endpoint:** `POST /roles`

**Request:**
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Secretario",
    "descripcion": "Gestiona información administrativa"
  }'
```

### Asignar Permiso a Rol

**Endpoint:** `POST /roles/:id/permisos`

**Request:**
```bash
curl -X POST http://localhost:3000/api/roles/3/permisos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_permiso": 5
  }'
```

### Obtener Permisos de Rol

**Endpoint:** `GET /roles/:id/permisos`

**Request:**
```bash
curl -X GET http://localhost:3000/api/roles/3/permisos \
  -H "Authorization: Bearer <token>"
```

### Listar Permisos

**Endpoint:** `GET /permisos`

**Request:**
```bash
curl -X GET http://localhost:3000/api/permisos \
  -H "Authorization: Bearer <token>"
```

### Obtener Permisos por Módulo

**Endpoint:** `GET /permisos/modulo/:modulo`

**Request:**
```bash
curl -X GET http://localhost:3000/api/permisos/modulo/PERSONAS \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_permiso": 1,
      "nombre": "PERSONAS_CREATE",
      "descripcion": "Crear personas",
      "modulo": "PERSONAS"
    },
    {
      "id_permiso": 2,
      "nombre": "PERSONAS_READ",
      "descripcion": "Leer personas",
      "modulo": "PERSONAS"
    }
  ]
}
```

## Ministerios

### Listar Ministerios

**Endpoint:** `GET /ministerios`

**Request:**
```bash
curl -X GET http://localhost:3000/api/ministerios \
  -H "Authorization: Bearer <token>"
```

### Crear Ministerio

**Endpoint:** `POST /ministerios`

**Request:**
```bash
curl -X POST http://localhost:3000/api/ministerios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ministerio de Alabanza",
    "descripcion": "Ministerio encargado de la música y alabanza",
    "lider_id": 1
  }'
```

### Asignar Persona a Ministerio

**Endpoint:** `POST /ministerios/:id/miembros`

**Request:**
```bash
curl -X POST http://localhost:3000/api/ministerios/1/miembros \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_persona": 2,
    "cargo": "Vocalista"
  }'
```

### Obtener Miembros de Ministerio

**Endpoint:** `GET /ministerios/:id/miembros`

**Request:**
```bash
curl -X GET http://localhost:3000/api/ministerios/1/miembros \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_persona": 2,
      "primer_nombre": "María",
      "primer_apellido": "González",
      "cargo": "Vocalista",
      "fecha_asignacion": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Actualizar Cargo de Miembro

**Endpoint:** `PUT /ministerios/:id/miembros/:personaId`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/ministerios/1/miembros/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "Líder de Alabanza"
  }'
```

## Familias

### Listar Familias

**Endpoint:** `GET /familias`

**Request:**
```bash
curl -X GET http://localhost:3000/api/familias \
  -H "Authorization: Bearer <token>"
```

### Crear Familia

**Endpoint:** `POST /familias`

**Request:**
```bash
curl -X POST http://localhost:3000/api/familias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Familia Pérez",
    "direccion": "Calle 123 #45-67",
    "telefono": "3001234567"
  }'
```

### Agregar Miembro a Familia

**Endpoint:** `POST /familias/:id/miembros`

**Request:**
```bash
curl -X POST http://localhost:3000/api/familias/1/miembros \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_persona": 1,
    "parentesco": "PADRE",
    "es_cabeza_familia": true
  }'
```

### Obtener Miembros de Familia

**Endpoint:** `GET /familias/:id/miembros`

**Request:**
```bash
curl -X GET http://localhost:3000/api/familias/1/miembros \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_persona": 1,
      "primer_nombre": "Juan",
      "primer_apellido": "Pérez",
      "parentesco": "PADRE",
      "es_cabeza_familia": true
    },
    {
      "id_persona": 2,
      "primer_nombre": "María",
      "primer_apellido": "Pérez",
      "parentesco": "MADRE",
      "es_cabeza_familia": false
    }
  ]
}
```

## Contactos

### Obtener Contactos de Persona

**Endpoint:** `GET /contactos/persona/:personaId`

**Request:**
```bash
curl -X GET http://localhost:3000/api/contactos/persona/1 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_contacto": 1,
      "tipo_contacto": "TELEFONO",
      "valor": "3001234567",
      "es_principal": true
    },
    {
      "id_contacto": 2,
      "tipo_contacto": "EMAIL",
      "valor": "juan.perez@example.com",
      "es_principal": true
    }
  ]
}
```

### Crear Contacto

**Endpoint:** `POST /contactos`

**Request:**
```bash
curl -X POST http://localhost:3000/api/contactos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_persona": 1,
    "tipo_contacto": "WHATSAPP",
    "valor": "3001234567",
    "es_principal": false
  }'
```

### Establecer Contacto como Principal

**Endpoint:** `PUT /contactos/:id/principal`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/contactos/3/principal \
  -H "Authorization: Bearer <token>"
```

## Eventos y Asistencias

### Listar Eventos

**Endpoint:** `GET /eventos?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/eventos?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Crear Evento

**Endpoint:** `POST /eventos`

**Request:**
```bash
curl -X POST http://localhost:3000/api/eventos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Culto Dominical",
    "descripcion": "Servicio de adoración dominical",
    "tipo_evento": "CULTO",
    "fecha_inicio": "2024-01-21T10:00:00Z",
    "fecha_fin": "2024-01-21T12:00:00Z",
    "lugar": "Templo Principal",
    "id_ministerio": 1
  }'
```

### Obtener Eventos por Rango de Fechas

**Endpoint:** `GET /eventos/fecha?start=2024-01-01&end=2024-01-31`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/eventos/fecha?start=2024-01-01&end=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Obtener Eventos por Ministerio

**Endpoint:** `GET /eventos/ministerio/:id`

**Request:**
```bash
curl -X GET http://localhost:3000/api/eventos/ministerio/1 \
  -H "Authorization: Bearer <token>"
```

### Registrar Asistencia a Evento

**Endpoint:** `POST /eventos/:id/asistencia`

**Request:**
```bash
curl -X POST http://localhost:3000/api/eventos/1/asistencia \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "asistencias": [
      {
        "id_persona": 1,
        "asistio": true,
        "observaciones": "Llegó puntual"
      },
      {
        "id_persona": 2,
        "asistio": false,
        "observaciones": "Enfermo"
      }
    ]
  }'
```

### Obtener Asistencias de Evento

**Endpoint:** `GET /eventos/:id/asistencia`

**Request:**
```bash
curl -X GET http://localhost:3000/api/eventos/1/asistencia \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_asistencia": 1,
      "id_persona": 1,
      "persona": {
        "primer_nombre": "Juan",
        "primer_apellido": "Pérez"
      },
      "asistio": true,
      "observaciones": "Llegó puntual",
      "fecha_registro": "2024-01-21T09:00:00.000Z"
    }
  ]
}
```

### Obtener Estadísticas de Asistencia

**Endpoint:** `GET /eventos/:id/estadisticas`

**Request:**
```bash
curl -X GET http://localhost:3000/api/eventos/1/estadisticas \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_registrados": 50,
    "total_asistieron": 42,
    "porcentaje_asistencia": 84.0,
    "total_no_asistieron": 8
  }
}
```

## Auditoría

### Listar Registros de Auditoría

**Endpoint:** `GET /auditoria?page=1&limit=20`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auditoria?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### Obtener Auditoría por Tabla

**Endpoint:** `GET /auditoria/tabla/:tabla`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auditoria/tabla/personas \
  -H "Authorization: Bearer <token>"
```

### Obtener Auditoría por Usuario

**Endpoint:** `GET /auditoria/usuario/:userId`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auditoria/usuario/1 \
  -H "Authorization: Bearer <token>"
```

### Obtener Auditoría por Rango de Fechas

**Endpoint:** `GET /auditoria/fecha?start=2024-01-01&end=2024-01-31`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auditoria/fecha?start=2024-01-01&end=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Obtener Historial de un Registro

**Endpoint:** `GET /auditoria/registro/:tabla/:id`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auditoria/registro/personas/1 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_auditoria": 1,
      "tabla": "personas",
      "id_registro": 1,
      "accion": "INSERT",
      "datos_nuevos": {
        "primer_nombre": "Juan",
        "primer_apellido": "Pérez"
      },
      "id_usuario": 1,
      "fecha_accion": "2024-01-15T10:00:00.000Z"
    },
    {
      "id_auditoria": 5,
      "tabla": "personas",
      "id_registro": 1,
      "accion": "UPDATE",
      "datos_anteriores": {
        "celular": "3001234567"
      },
      "datos_nuevos": {
        "celular": "3109876543"
      },
      "id_usuario": 1,
      "fecha_accion": "2024-01-16T14:30:00.000Z"
    }
  ]
}
```

## Notas Importantes

1. **Paginación**: Todos los endpoints de listado soportan paginación con parámetros `page` y `limit`
2. **Límites**: El límite máximo de registros por página es 100
3. **Fechas**: Las fechas deben enviarse en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)
4. **Soft Delete**: Las eliminaciones son lógicas (estado = false), no físicas
5. **Auditoría**: Todas las operaciones de creación, actualización y eliminación se registran automáticamente
