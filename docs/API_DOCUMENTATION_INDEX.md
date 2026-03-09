# Documentación de la API MICASA

Bienvenido a la documentación completa de la API MICASA. Esta guía te ayudará a integrar y usar la API de manera efectiva.

## 📚 Índice de Documentación

### Documentación Interactiva

- **[Swagger UI](http://localhost:3000/api-docs)** - Documentación interactiva con pruebas en vivo
- **[OpenAPI Spec JSON](http://localhost:3000/api-docs.json)** - Especificación OpenAPI 3.0 en formato JSON

### Guías de Uso

1. **[Ejemplos de Uso de la API](./API_USAGE_EXAMPLES.md)**
   - Ejemplos prácticos de cada endpoint
   - Requests y responses completos
   - Casos de uso comunes
   - Formato: cURL

2. **[Códigos de Error y Soluciones](./API_ERROR_CODES.md)**
   - Todos los códigos HTTP y sus significados
   - Errores comunes por módulo
   - Guía de troubleshooting
   - Soluciones paso a paso

3. **[Rate Limiting](./API_RATE_LIMITING.md)**
   - Límites de tasa configurados
   - Cómo funciona el rate limiting
   - Mejores prácticas para evitar límites
   - Estrategias de implementación

4. **[Arquitectura del Sistema](./ARCHITECTURE.md)**
   - Diseño general del sistema
   - Flujos principales
   - Decisiones de diseño
   - Patrones y convenciones

### Colecciones de Requests

- **[Archivo HTTP](../api-requests.http)** - Para VS Code REST Client o IntelliJ HTTP Client
- **[Colección Postman](../postman_collection.json)** - Importar en Postman

## 🚀 Inicio Rápido

### 1. Autenticación

Todos los endpoints (excepto `/auth/login`) requieren autenticación JWT.

```bash
# Obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin",
    "clave": "Admin123!"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 2. Usar el Token

Incluir el token en el header `Authorization`:

```bash
curl -X GET http://localhost:3000/api/personas \
  -H "Authorization: Bearer <tu_token>"
```

### 3. Explorar la API

Visita [http://localhost:3000/api-docs](http://localhost:3000/api-docs) para explorar todos los endpoints de forma interactiva.

## 📋 Módulos de la API

La API está organizada en los siguientes módulos:

| Módulo | Descripción | Endpoints Base |
|--------|-------------|----------------|
| **Autenticación** | Login, logout, gestión de sesiones | `/api/auth/*` |
| **Personas** | Gestión de personas de la iglesia | `/api/personas/*` |
| **Usuarios** | Gestión de usuarios del sistema | `/api/usuarios/*` |
| **Roles** | Gestión de roles y permisos | `/api/roles/*` |
| **Permisos** | Gestión de permisos | `/api/permisos/*` |
| **Ministerios** | Gestión de ministerios y miembros | `/api/ministerios/*` |
| **Familias** | Gestión de familias y relaciones | `/api/familias/*` |
| **Contactos** | Contactos adicionales de personas | `/api/contactos/*` |
| **Eventos** | Eventos y asistencias | `/api/eventos/*` |
| **Auditoría** | Consulta de registros de auditoría | `/api/auditoria/*` |

## 🔑 Conceptos Clave

### Autenticación y Autorización

- **JWT Tokens**: Duración de 8 horas
- **RBAC**: Control de acceso basado en roles
- **Permisos**: Cacheados en el token para mejor rendimiento

### Paginación

Todos los endpoints de listado soportan paginación:

```
GET /api/personas?page=1&limit=10
```

**Parámetros:**
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10, max: 100)

**Respuesta incluye metadata:**
```json
{
  "data": [...],
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Soft Delete

Las eliminaciones son lógicas (estado = false), no físicas:

```bash
DELETE /api/personas/1  # Marca estado = false
```

### Auditoría

Todas las operaciones de creación, actualización y eliminación se registran automáticamente:

```bash
GET /api/auditoria/registro/personas/1  # Ver historial completo
```

## 🛡️ Seguridad

### Rate Limiting

- **General**: 100 requests/minuto por IP
- **Login**: 5 intentos/minuto por IP

Ver [documentación completa de rate limiting](./API_RATE_LIMITING.md).

### Headers de Seguridad

La API implementa:
- Helmet para headers HTTP seguros
- CORS configurado
- Compresión gzip
- Validación de entrada con Zod

### Mejores Prácticas

1. **Nunca exponer tokens**: No incluir tokens en URLs o logs
2. **HTTPS en producción**: Siempre usar conexiones seguras
3. **Renovar tokens**: Implementar refresh token
4. **Validar respuestas**: Verificar `success: true` antes de procesar
5. **Manejar errores**: Implementar retry con backoff exponencial

## 📊 Códigos de Respuesta HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error de validación |
| 401 | Unauthorized | Token faltante o inválido |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Duplicado o conflicto |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

Ver [guía completa de códigos de error](./API_ERROR_CODES.md).

## 🔧 Herramientas Recomendadas

### Para Desarrollo

- **[Postman](https://www.postman.com/)** - Cliente API con colecciones
- **[Insomnia](https://insomnia.rest/)** - Cliente API alternativo
- **[VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)** - Extensión para VS Code

### Para Testing

- **[Jest](https://jestjs.io/)** - Framework de testing
- **[Supertest](https://github.com/visionmedia/supertest)** - Testing de APIs HTTP
- **[fast-check](https://github.com/dubzzz/fast-check)** - Property-based testing

### Para Monitoreo

- **[Winston](https://github.com/winstonjs/winston)** - Logging (ya incluido)
- **[PM2](https://pm2.keymetrics.io/)** - Process manager
- **[New Relic](https://newrelic.com/)** - APM (opcional)

## 📖 Ejemplos por Caso de Uso

### Caso 1: Registrar Nueva Persona

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","clave":"Admin123!"}' \
  | jq -r '.data.token')

# 2. Crear persona
curl -X POST http://localhost:3000/api/personas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "identificacion": "1234567890",
    "tipo_identificacion": "CC",
    "genero": "M",
    "fecha_nacimiento": "1990-05-15"
  }'
```

### Caso 2: Crear Usuario y Asignar Rol

```bash
# 1. Crear usuario
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_persona": 2,
    "usuario": "jperez",
    "clave": "Password123!"
  }'

# 2. Asignar rol
curl -X POST http://localhost:3000/api/usuarios/2/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id_rol": 2}'
```

### Caso 3: Registrar Asistencia a Evento

```bash
# 1. Crear evento
EVENT_ID=$(curl -X POST http://localhost:3000/api/eventos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Culto Dominical",
    "tipo_evento": "CULTO",
    "fecha_inicio": "2024-01-21T10:00:00Z"
  }' | jq -r '.data.id_evento')

# 2. Registrar asistencias
curl -X POST http://localhost:3000/api/eventos/$EVENT_ID/asistencia \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asistencias": [
      {"id_persona": 1, "asistio": true},
      {"id_persona": 2, "asistio": false}
    ]
  }'

# 3. Ver estadísticas
curl -X GET http://localhost:3000/api/eventos/$EVENT_ID/estadisticas \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### Problema: Error 401 "Token inválido"

**Soluciones:**
1. Verificar que el token no haya expirado (8 horas)
2. Asegurar formato correcto: `Authorization: Bearer <token>`
3. Realizar login nuevamente

### Problema: Error 403 "Sin permisos"

**Soluciones:**
1. Verificar permisos del usuario: `GET /usuarios/:id/permisos`
2. Contactar administrador para asignar permisos
3. Realizar login nuevamente si los permisos fueron actualizados

### Problema: Error 429 "Rate limit excedido"

**Soluciones:**
1. Esperar 60 segundos
2. Implementar caché en el cliente
3. Reducir frecuencia de solicitudes
4. Ver [guía de rate limiting](./API_RATE_LIMITING.md)

Ver [guía completa de troubleshooting](./API_ERROR_CODES.md#troubleshooting).

## 📞 Soporte

### Documentación Adicional

- [README Principal](../README.md)
- [Guía de Contribución](../CONTRIBUTING.md)
- [Arquitectura del Sistema](./ARCHITECTURE.md)

### Contacto

Para preguntas, bugs o sugerencias:
- Email: soporte@micasa.com
- Issues: [GitHub Issues](https://github.com/tu-org/micasa-backend/issues)

## 📝 Changelog

### Versión 1.0.0 (2024-01-15)

- ✅ Autenticación JWT completa
- ✅ CRUD completo de todos los módulos
- ✅ Sistema de roles y permisos
- ✅ Auditoría automática
- ✅ Rate limiting
- ✅ Documentación Swagger
- ✅ Paginación en todos los listados
- ✅ Soft delete

## 📄 Licencia

ISC License - Ver [LICENSE](../LICENSE) para más detalles.

---

**¿Listo para empezar?** Visita [http://localhost:3000/api-docs](http://localhost:3000/api-docs) para explorar la API de forma interactiva.
