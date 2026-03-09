# Security Event Logging

## Overview

The MICASA backend implements comprehensive security event logging to track authentication failures, authorization denials, and role/permission changes. All security events are logged using Winston logger with structured JSON format.

## Security Events Logged

### 1. Failed Login Attempts

**Event:** User attempts to login with invalid credentials

**Log Level:** `warn`

**Information Logged:**
- Username attempted
- IP address of the request
- Reason for failure (user not found/inactive or incorrect password)
- Timestamp

**Example Log:**
```json
{
  "level": "warn",
  "message": "Intento de login fallido: usuario no encontrado o inactivo",
  "usuario": "john_doe",
  "ip": "192.168.1.100",
  "razon": "usuario_no_encontrado_o_inactivo",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Location:** `src/services/auth.service.ts` - `login()` method

### 2. Successful Login

**Event:** User successfully authenticates

**Log Level:** `info`

**Information Logged:**
- Username
- User ID
- IP address
- Timestamp

**Example Log:**
```json
{
  "level": "info",
  "message": "Login exitoso",
  "usuario": "john_doe",
  "userId": 123,
  "ip": "192.168.1.100",
  "timestamp": "2024-01-15T10:31:00.456Z"
}
```

**Location:** `src/services/auth.service.ts` - `login()` method

### 3. Access Denied - Missing Permission

**Event:** User attempts to access a resource without required permission

**Log Level:** `warn`

**Information Logged:**
- Username
- User ID
- Required permission
- User's current permissions
- Request path and method
- IP address
- Timestamp

**Example Log:**
```json
{
  "level": "warn",
  "message": "Acceso denegado por falta de permisos",
  "usuario": "john_doe",
  "userId": 123,
  "permisoRequerido": "PERSONAS_DELETE",
  "permisosUsuario": ["PERSONAS_READ", "PERSONAS_CREATE"],
  "path": "/api/personas/45",
  "method": "DELETE",
  "ip": "192.168.1.100",
  "timestamp": "2024-01-15T10:32:15.789Z"
}
```

**Location:** `src/middlewares/authorization.middleware.ts` - `requirePermission()` middleware

### 4. Access Denied - Missing Role

**Event:** User attempts to access a resource without required role

**Log Level:** `warn`

**Information Logged:**
- Username
- User ID
- Required role
- User's current roles
- Request path and method
- IP address
- Timestamp

**Example Log:**
```json
{
  "level": "warn",
  "message": "Acceso denegado por falta de rol",
  "usuario": "john_doe",
  "userId": 123,
  "rolRequerido": "Administrador",
  "rolesUsuario": ["Usuario", "Lector"],
  "path": "/api/usuarios",
  "method": "POST",
  "ip": "192.168.1.100",
  "timestamp": "2024-01-15T10:33:00.123Z"
}
```

**Location:** `src/middlewares/authorization.middleware.ts` - `requireRole()` middleware

### 5. Role Assignment to User

**Event:** A role is assigned to a user

**Log Level:** `info`

**Information Logged:**
- User ID and username
- Role ID and name
- User who performed the assignment
- Action type (assign or reactivate)
- Timestamp

**Example Log:**
```json
{
  "level": "info",
  "message": "Rol asignado a usuario",
  "usuarioId": 123,
  "usuarioNombre": "john_doe",
  "rolId": 5,
  "rolNombre": "Editor",
  "asignadoPor": 1,
  "accion": "asignar_rol",
  "timestamp": "2024-01-15T10:35:00.456Z"
}
```

**Location:** `src/services/usuarios.service.ts` - `assignRole()` method

### 6. Role Removal from User

**Event:** A role is removed from a user

**Log Level:** `info`

**Information Logged:**
- User ID and username
- Role ID and name
- User who performed the removal
- Action type
- Timestamp

**Example Log:**
```json
{
  "level": "info",
  "message": "Rol removido de usuario",
  "usuarioId": 123,
  "usuarioNombre": "john_doe",
  "rolId": 5,
  "rolNombre": "Editor",
  "removidoPor": 1,
  "accion": "remover_rol",
  "timestamp": "2024-01-15T10:36:00.789Z"
}
```

**Location:** `src/services/usuarios.service.ts` - `removeRole()` method

### 7. Permission Assignment to Role

**Event:** A permission is assigned to a role

**Log Level:** `info`

**Information Logged:**
- Role ID and name
- Permission ID and name
- User who performed the assignment
- Action type (assign or reactivate)
- Timestamp

**Example Log:**
```json
{
  "level": "info",
  "message": "Permiso asignado a rol",
  "rolId": 5,
  "rolNombre": "Editor",
  "permisoId": 12,
  "permisoNombre": "PERSONAS_UPDATE",
  "usuarioId": 1,
  "accion": "asignar_permiso",
  "timestamp": "2024-01-15T10:37:00.123Z"
}
```

**Location:** `src/services/roles.service.ts` - `assignPermission()` method

### 8. Permission Removal from Role

**Event:** A permission is removed from a role

**Log Level:** `info`

**Information Logged:**
- Role ID and name
- Permission ID and name
- User who performed the removal
- Action type
- Timestamp

**Example Log:**
```json
{
  "level": "info",
  "message": "Permiso removido de rol",
  "rolId": 5,
  "rolNombre": "Editor",
  "permisoId": 12,
  "permisoNombre": "PERSONAS_UPDATE",
  "usuarioId": 1,
  "accion": "remover_permiso",
  "timestamp": "2024-01-15T10:38:00.456Z"
}
```

**Location:** `src/services/roles.service.ts` - `removePermission()` method

## Security Guarantees

### What is NEVER Logged

The following sensitive information is **NEVER** logged:

1. **Passwords** - Neither plaintext nor hashed passwords
2. **JWT Tokens** - Access tokens or refresh tokens
3. **Password Hashes** - Bcrypt hashes are never included in logs
4. **Authorization Headers** - Bearer tokens are not logged

### Code Review Checklist

When reviewing code changes, verify:

- [ ] No `logger` calls contain `clave`, `password`, or `token` fields
- [ ] User objects are sanitized before logging (password field removed)
- [ ] Authorization headers are not logged
- [ ] JWT payloads are not logged in their entirety

## Log Storage and Retention

### Development Environment
- Logs are written to console with colorized output
- No file persistence in development

### Production Environment
- Logs are written to `logs/app.log` in JSON format
- Console output is also enabled for container logging
- Log rotation should be configured at the infrastructure level

### Recommended Retention Policy
- Security logs (warn/error): 90 days minimum
- Info logs: 30 days
- Compliance requirements may mandate longer retention

## Monitoring and Alerting

### Recommended Alerts

1. **High Failed Login Rate**
   - Trigger: More than 10 failed login attempts from same IP in 5 minutes
   - Action: Potential brute force attack

2. **Repeated Authorization Denials**
   - Trigger: Same user denied access 5+ times in 10 minutes
   - Action: Potential privilege escalation attempt

3. **Unusual Role/Permission Changes**
   - Trigger: Multiple role/permission changes outside business hours
   - Action: Potential unauthorized access

## Compliance

This logging implementation helps meet the following requirements:

- **Requisito 16.7**: Registrar intentos de login fallidos ✓
- **Requisito 16.8**: Registrar accesos denegados por falta de permisos ✓
- **Requisito 18.2**: Registrar intentos de autenticación fallidos ✓
- **Requisito 18.3**: Registrar cambios en roles y permisos ✓
- **Requisito 18.4**: Nunca registrar contraseñas o tokens en logs ✓

## Testing

Security logging is tested in `tests/security-logging.test.ts`:

- Failed login attempts are logged correctly
- Successful logins are logged without sensitive data
- Authorization denials are logged with context
- Role/permission changes are logged
- Passwords and tokens are never logged

Run tests:
```bash
npm test tests/security-logging.test.ts
```

## Example Queries

### Find Failed Login Attempts for User
```bash
grep "Intento de login fallido" logs/app.log | grep "john_doe"
```

### Find All Authorization Denials
```bash
grep "Acceso denegado" logs/app.log
```

### Find Role Changes for User
```bash
grep -E "(Rol asignado|Rol removido)" logs/app.log | grep "usuarioId.*123"
```

### Find All Security Events from IP
```bash
grep "192.168.1.100" logs/app.log | grep -E "(login|Acceso denegado)"
```

## Future Enhancements

Potential improvements to security logging:

1. **Geolocation** - Add country/city based on IP address
2. **User Agent Logging** - Track browser/device information
3. **Session Tracking** - Link events to session IDs
4. **Anomaly Detection** - ML-based detection of unusual patterns
5. **SIEM Integration** - Export logs to Security Information and Event Management systems
6. **Real-time Notifications** - Webhook/email alerts for critical events
