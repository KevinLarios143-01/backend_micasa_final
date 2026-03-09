# Códigos de Error y Soluciones - API MICASA

Esta guía documenta todos los códigos de error HTTP que puede retornar la API, sus causas comunes y cómo resolverlos.

## Tabla de Contenidos

- [Formato de Respuestas de Error](#formato-de-respuestas-de-error)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Errores Comunes por Código](#errores-comunes-por-código)
- [Errores por Módulo](#errores-por-módulo)
- [Troubleshooting](#troubleshooting)

## Formato de Respuestas de Error

Todas las respuestas de error siguen este formato estándar:

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "details": [
    {
      "field": "nombre_campo",
      "message": "Descripción específica del error"
    }
  ]
}
```

**Campos:**
- `success`: Siempre `false` para errores
- `error`: Mensaje general del error
- `details`: (Opcional) Array con detalles específicos, especialmente para errores de validación

## Códigos de Estado HTTP

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error de validación o datos inválidos |
| 401 | Unauthorized | Autenticación requerida o token inválido |
| 403 | Forbidden | No tiene permisos para realizar la acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto con el estado actual (ej: duplicado) |
| 429 | Too Many Requests | Límite de rate limiting excedido |
| 500 | Internal Server Error | Error interno del servidor |

## Errores Comunes por Código

### 400 - Bad Request

#### Error de Validación de Campos

**Causa:** Los datos enviados no cumplen con las reglas de validación.

**Ejemplo de Respuesta:**
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
      "field": "primer_nombre",
      "message": "El campo primer_nombre es requerido"
    }
  ]
}
```

**Soluciones:**
- Verificar que todos los campos requeridos estén presentes
- Validar formatos de email, fechas, números, etc.
- Revisar longitudes mínimas y máximas de campos de texto
- Consultar la documentación Swagger para ver los esquemas de validación

#### Fecha de Bautizo Inválida

**Causa:** La fecha de bautizo es anterior a la fecha de nacimiento.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Fecha de bautizo debe ser posterior a fecha de nacimiento"
}
```

**Solución:**
- Asegurar que `fecha_bautizo` > `fecha_nacimiento`

#### Fecha de Fin de Evento Inválida

**Causa:** La fecha de fin del evento es anterior a la fecha de inicio.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Fecha de fin debe ser posterior o igual a fecha de inicio"
}
```

**Solución:**
- Asegurar que `fecha_fin` >= `fecha_inicio`

#### Referencia Inválida

**Causa:** Se intenta crear un registro con una referencia a otro registro que no existe.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "La persona especificada no existe"
}
```

**Solución:**
- Verificar que el ID referenciado existe en la base de datos
- Consultar primero el recurso antes de crear la relación

### 401 - Unauthorized

#### Token No Proporcionado

**Causa:** No se incluyó el token JWT en el header Authorization.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Token no proporcionado"
}
```

**Solución:**
- Incluir el header: `Authorization: Bearer <tu_token>`
- Asegurar que el formato sea correcto (Bearer + espacio + token)

#### Token Inválido

**Causa:** El token JWT es inválido o está mal formado.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Token inválido"
}
```

**Soluciones:**
- Verificar que el token no esté corrupto o modificado
- Asegurar que se está usando el token completo
- Realizar login nuevamente para obtener un token válido

#### Token Expirado

**Causa:** El token JWT ha superado su tiempo de vida (8 horas).

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Token expirado"
}
```

**Solución:**
- Realizar login nuevamente para obtener un nuevo token
- Implementar refresh token en el cliente para renovar automáticamente

#### Credenciales Inválidas

**Causa:** Usuario o contraseña incorrectos en el login.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

**Soluciones:**
- Verificar que el nombre de usuario sea correcto
- Verificar que la contraseña sea correcta
- Verificar que el usuario esté activo (estado = true)

#### Usuario Inactivo

**Causa:** El usuario existe pero está desactivado (estado = false).

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Usuario inactivo"
}
```

**Solución:**
- Contactar al administrador para reactivar el usuario
- Verificar el estado del usuario en la base de datos

### 403 - Forbidden

#### Sin Permisos

**Causa:** El usuario no tiene el permiso requerido para realizar la acción.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "No tiene permisos para realizar esta acción",
  "requiredPermission": "PERSONAS_CREATE"
}
```

**Soluciones:**
- Verificar que el usuario tenga el rol apropiado
- Contactar al administrador para solicitar los permisos necesarios
- Verificar que los roles del usuario tengan los permisos asignados
- Realizar login nuevamente si los permisos fueron actualizados recientemente

### 404 - Not Found

#### Recurso No Encontrado

**Causa:** El recurso solicitado no existe en la base de datos.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Persona no encontrada"
}
```

**Soluciones:**
- Verificar que el ID sea correcto
- Verificar que el recurso no haya sido eliminado (soft delete)
- Listar los recursos disponibles antes de intentar acceder a uno específico

#### Endpoint No Encontrado

**Causa:** La ruta solicitada no existe en la API.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Ruta no encontrada"
}
```

**Soluciones:**
- Verificar la URL del endpoint
- Consultar la documentación Swagger en `/api-docs`
- Verificar el método HTTP (GET, POST, PUT, DELETE)

### 409 - Conflict

#### Violación de Unicidad

**Causa:** Se intenta crear un registro con un valor que debe ser único pero ya existe.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Ya existe un registro con estos datos",
  "field": "identificacion"
}
```

**Casos Comunes:**
- Identificación de persona duplicada
- Nombre de usuario duplicado
- Email duplicado
- Nombre de rol duplicado
- Nombre de permiso duplicado
- Nombre de ministerio duplicado

**Soluciones:**
- Verificar que el valor sea único antes de crear
- Buscar el registro existente y actualizarlo en lugar de crear uno nuevo
- Usar un valor diferente para el campo único

#### Usuario Ya Tiene Rol

**Causa:** Se intenta asignar un rol que el usuario ya tiene.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "El usuario ya tiene este rol asignado"
}
```

**Solución:**
- Verificar los roles actuales del usuario antes de asignar
- Si el rol estaba inactivo, el sistema lo reactivará automáticamente

#### Cabeza de Familia Duplicada

**Causa:** Se intenta marcar a una persona como cabeza de familia cuando ya existe otra.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "La familia ya tiene una cabeza de familia"
}
```

**Solución:**
- Remover la cabeza de familia actual antes de asignar una nueva
- O actualizar la cabeza de familia existente

#### Contacto Principal Duplicado

**Causa:** Se intenta marcar un contacto como principal cuando ya existe otro del mismo tipo.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Ya existe un contacto principal de este tipo"
}
```

**Solución:**
- Desmarcar el contacto principal actual antes de marcar otro
- O actualizar el contacto principal existente

#### Registro Referenciado

**Causa:** Se intenta eliminar un registro que está siendo referenciado por otros registros.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "No se puede eliminar el registro porque está siendo referenciado"
}
```

**Solución:**
- Eliminar primero los registros que referencian este registro
- O usar soft delete si está disponible

### 429 - Too Many Requests

#### Rate Limit Excedido

**Causa:** Se ha superado el límite de solicitudes permitidas.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Demasiadas solicitudes. Por favor, intente más tarde."
}
```

**Límites Configurados:**
- **General**: 100 requests por minuto por IP
- **Login**: 5 intentos por minuto por IP

**Soluciones:**
- Esperar 1 minuto antes de reintentar
- Implementar backoff exponencial en el cliente
- Reducir la frecuencia de solicitudes
- Cachear respuestas en el cliente cuando sea posible

### 500 - Internal Server Error

#### Error Interno del Servidor

**Causa:** Error inesperado en el servidor.

**Ejemplo de Respuesta:**
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

**Soluciones:**
- Verificar los logs del servidor para más detalles
- Contactar al administrador del sistema
- Reintentar la solicitud después de un tiempo
- Reportar el error con los detalles de la solicitud

## Errores por Módulo

### Autenticación

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Credenciales inválidas | 401 | Usuario o contraseña incorrectos | Verificar credenciales |
| Usuario inactivo | 401 | Usuario desactivado | Contactar administrador |
| Token expirado | 401 | Token JWT expirado (>8h) | Realizar login nuevamente |
| Contraseña muy corta | 400 | Contraseña < 8 caracteres | Usar contraseña más larga |

### Personas

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Identificación duplicada | 409 | Ya existe persona con esa identificación | Usar identificación diferente |
| Fecha bautizo inválida | 400 | Fecha bautizo < fecha nacimiento | Corregir fechas |
| Email inválido | 400 | Formato de email incorrecto | Usar formato válido |
| Persona no encontrada | 404 | ID no existe | Verificar ID |

### Usuarios

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Usuario duplicado | 409 | Nombre de usuario ya existe | Usar nombre diferente |
| Persona ya tiene usuario | 409 | La persona ya tiene un usuario | Usar persona diferente |
| Usuario muy corto | 400 | Usuario < 4 caracteres | Usar nombre más largo |
| Contraseña muy corta | 400 | Contraseña < 8 caracteres | Usar contraseña más larga |

### Roles y Permisos

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Rol duplicado | 409 | Nombre de rol ya existe | Usar nombre diferente |
| Permiso duplicado | 409 | Nombre de permiso ya existe | Usar nombre diferente |
| Rol no encontrado | 404 | ID de rol no existe | Verificar ID |
| Permiso no encontrado | 404 | ID de permiso no existe | Verificar ID |

### Ministerios

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Ministerio duplicado | 409 | Nombre de ministerio ya existe | Usar nombre diferente |
| Líder no encontrado | 400 | ID de líder no existe | Verificar ID de persona |
| Persona ya en ministerio | 409 | Persona ya es miembro | Actualizar cargo existente |

### Familias

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Cabeza de familia duplicada | 409 | Ya existe cabeza de familia | Remover cabeza actual |
| Parentesco inválido | 400 | Valor de parentesco no permitido | Usar valor válido |
| Persona ya en familia | 409 | Persona ya es miembro | Actualizar parentesco |

### Contactos

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Tipo contacto inválido | 400 | Tipo no permitido | Usar tipo válido |
| Email inválido | 400 | Formato de email incorrecto | Corregir formato |
| Contacto principal duplicado | 409 | Ya existe principal del mismo tipo | Desmarcar actual |

### Eventos

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| Fecha fin inválida | 400 | Fecha fin < fecha inicio | Corregir fechas |
| Tipo evento inválido | 400 | Tipo no permitido | Usar tipo válido |
| Ministerio no encontrado | 400 | ID de ministerio no existe | Verificar ID |
| Asistencia duplicada | 409 | Ya existe registro de asistencia | Actualizar existente |

## Troubleshooting

### Problema: No puedo autenticarme

**Síntomas:**
- Recibo error 401 al hacer login
- Mensaje: "Credenciales inválidas"

**Pasos de diagnóstico:**
1. Verificar que el usuario existe en la base de datos
2. Verificar que el usuario está activo (estado = true)
3. Verificar que la contraseña es correcta
4. Verificar que no hay espacios extra en usuario o contraseña
5. Verificar los logs del servidor para más detalles

### Problema: Token expira muy rápido

**Síntomas:**
- Recibo error 401 "Token expirado" frecuentemente

**Solución:**
- Los tokens tienen una duración de 8 horas
- Implementar refresh token en el cliente
- Realizar login nuevamente cuando expire

### Problema: No tengo permisos para una acción

**Síntomas:**
- Recibo error 403 "No tiene permisos"

**Pasos de diagnóstico:**
1. Verificar qué permisos tiene el usuario: `GET /usuarios/:id/permisos`
2. Verificar qué roles tiene el usuario: `GET /usuarios/:id/roles`
3. Verificar qué permisos tiene cada rol: `GET /roles/:id/permisos`
4. Contactar al administrador para asignar los permisos necesarios
5. Realizar login nuevamente después de cambios en permisos

### Problema: Recibo error 409 al crear un registro

**Síntomas:**
- Error "Ya existe un registro con estos datos"

**Pasos de diagnóstico:**
1. Identificar qué campo está duplicado (ver campo `field` en la respuesta)
2. Buscar el registro existente
3. Decidir si actualizar el existente o usar un valor diferente

### Problema: Rate limiting me bloquea

**Síntomas:**
- Error 429 "Demasiadas solicitudes"

**Soluciones:**
1. Esperar 1 minuto antes de reintentar
2. Reducir la frecuencia de solicitudes
3. Implementar caché en el cliente
4. Implementar backoff exponencial

### Problema: Paginación no funciona como esperaba

**Síntomas:**
- No recibo todos los registros
- Metadata de paginación incorrecta

**Verificaciones:**
1. Revisar parámetros `page` y `limit` en la URL
2. Verificar que `limit` no exceda 100 (máximo permitido)
3. Usar `metadata.totalPages` para saber cuántas páginas hay
4. Usar `metadata.hasNextPage` para saber si hay más páginas

## Contacto y Soporte

Si encuentras un error no documentado aquí o necesitas ayuda adicional:

1. Consultar la documentación Swagger en `/api-docs`
2. Revisar los logs del servidor
3. Contactar al equipo de desarrollo
4. Reportar el bug con:
   - Endpoint afectado
   - Request completo (sin datos sensibles)
   - Response recibida
   - Comportamiento esperado
