# Lista de Verificación de Seguridad para Producción

Este documento proporciona una lista de verificación completa para asegurar que todas las medidas de seguridad estén correctamente configuradas antes del despliegue en producción.

---

## 🔒 Configuración de Seguridad Crítica

### 1. Variables de Entorno

#### JWT Secrets ⚠️ CRÍTICO
- [ ] Generar `JWT_SECRET` fuerte (mínimo 32 caracteres)
- [ ] Generar `REFRESH_TOKEN_SECRET` fuerte (mínimo 32 caracteres)
- [ ] Verificar que no se usen valores por defecto
- [ ] Almacenar secrets de forma segura (nunca en repositorio)

**Comando para generar secrets:**
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ejemplo de configuración segura:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
REFRESH_TOKEN_SECRET=f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

#### CORS Configuration ⚠️ CRÍTICO
- [ ] Configurar `CORS_ORIGIN` con dominio(s) real(es)
- [ ] Verificar que NO se use wildcard (`*`)
- [ ] Probar acceso desde frontend en producción

**Ejemplos válidos:**
```env
# Un solo origen
CORS_ORIGIN=https://app.micasa.com

# Múltiples orígenes
CORS_ORIGIN=https://app.micasa.com,https://admin.micasa.com
```

#### NODE_ENV
- [ ] Establecer `NODE_ENV=production`
- [ ] Verificar que las validaciones de producción se activen

#### Database
- [ ] Configurar `DATABASE_URL` con credenciales de producción
- [ ] Usar usuario de base de datos con permisos mínimos necesarios
- [ ] Habilitar SSL para conexión a base de datos

---

## 🛡️ Configuración de Infraestructura

### HTTPS/SSL
- [ ] Obtener certificado SSL válido (Let's Encrypt, etc.)
- [ ] Configurar reverse proxy (nginx/Apache) para HTTPS
- [ ] Redirigir todo tráfico HTTP a HTTPS
- [ ] Configurar HSTS (Strict-Transport-Security)

**Ejemplo de configuración nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.micasa.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name api.micasa.com;
    return 301 https://$server_name$request_uri;
}
```

### Firewall
- [ ] Configurar firewall para permitir solo puertos necesarios (80, 443)
- [ ] Bloquear acceso directo al puerto de la aplicación (3000)
- [ ] Configurar fail2ban para protección contra ataques

---

## 🔐 Seguridad de Base de Datos

### PostgreSQL
- [ ] Crear usuario específico para la aplicación
- [ ] Otorgar solo permisos necesarios (no superuser)
- [ ] Habilitar SSL para conexiones
- [ ] Configurar pg_hba.conf para restringir acceso
- [ ] Realizar backups automáticos regulares
- [ ] Encriptar backups

**Ejemplo de creación de usuario:**
```sql
-- Crear usuario con permisos limitados
CREATE USER micasa_app WITH PASSWORD 'strong_password_here';

-- Otorgar permisos solo en la base de datos específica
GRANT CONNECT ON DATABASE micasa TO micasa_app;
GRANT USAGE ON SCHEMA public TO micasa_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO micasa_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO micasa_app;
```

---

## 📊 Monitoreo y Logging

### Logging
- [ ] Configurar logs en archivo persistente
- [ ] Implementar rotación de logs
- [ ] Configurar nivel de log apropiado (info o warn)
- [ ] Verificar que no se logueen contraseñas o tokens
- [ ] Configurar alertas para errores críticos

### Monitoreo
- [ ] Implementar health checks
- [ ] Configurar monitoreo de uptime
- [ ] Monitorear uso de recursos (CPU, memoria, disco)
- [ ] Configurar alertas para anomalías

---

## 🚦 Rate Limiting

### Configuración Actual
- [x] Rate limiting general: 100 requests/minuto
- [x] Rate limiting login: 5 intentos/minuto
- [ ] Considerar ajustar límites según tráfico esperado

### Recomendaciones para Producción
```env
# Más restrictivo en producción
RATE_LIMIT_MAX_REQUESTS=50
LOGIN_RATE_LIMIT_MAX=3
```

---

## 🔑 Gestión de Contraseñas

### Bcrypt
- [x] Factor de costo: 10 (mínimo cumplido)
- [ ] Considerar aumentar a 12 para mayor seguridad

### Políticas de Contraseñas
- [ ] Implementar validación de complejidad
- [ ] Requerir longitud mínima (actual: 8 caracteres)
- [ ] Considerar política de rotación de contraseñas
- [ ] Implementar recuperación segura de contraseñas

---

## 🎯 Headers de Seguridad

### Helmet
- [x] Helmet configurado con valores por defecto
- [ ] Considerar configuración personalizada de CSP

**Configuración avanzada opcional:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## 📝 Auditoría y Compliance

### Auditoría
- [x] Sistema de auditoría implementado
- [ ] Verificar que todas las operaciones críticas se auditen
- [ ] Configurar retención de logs de auditoría
- [ ] Implementar revisión periódica de logs

### Compliance
- [ ] Revisar requisitos de GDPR/LOPD si aplica
- [ ] Implementar política de privacidad
- [ ] Documentar manejo de datos personales
- [ ] Configurar procedimientos de eliminación de datos

---

## 🧪 Testing de Seguridad

### Antes del Despliegue
- [ ] Ejecutar todos los tests unitarios
- [ ] Ejecutar tests de integración
- [ ] Realizar pruebas de penetración básicas
- [ ] Verificar que no haya secrets en el código
- [ ] Escanear dependencias con `npm audit`

**Comandos de verificación:**
```bash
# Ejecutar tests
npm test

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Verificar secrets en código
git secrets --scan
```

---

## 🚀 Despliegue

### Pre-Despliegue
- [ ] Crear archivo `.env.production` con configuración segura
- [ ] Verificar que `.env` no esté en el repositorio
- [ ] Ejecutar migraciones de base de datos
- [ ] Ejecutar seeds de datos iniciales
- [ ] Verificar conectividad a base de datos

### Post-Despliegue
- [ ] Verificar que la aplicación inicie correctamente
- [ ] Probar endpoint `/health`
- [ ] Probar login con usuario administrador
- [ ] Verificar que CORS funcione correctamente
- [ ] Probar rate limiting
- [ ] Verificar logs de aplicación
- [ ] Monitorear errores en las primeras horas

---

## 📋 Checklist Rápido de Despliegue

```
[ ] JWT_SECRET generado (32+ caracteres)
[ ] REFRESH_TOKEN_SECRET generado (32+ caracteres)
[ ] CORS_ORIGIN configurado (sin wildcard)
[ ] NODE_ENV=production
[ ] DATABASE_URL configurado con SSL
[ ] HTTPS configurado en reverse proxy
[ ] Certificado SSL válido
[ ] Firewall configurado
[ ] Logs configurados
[ ] Backups automáticos configurados
[ ] Health checks funcionando
[ ] Tests pasando
[ ] npm audit sin vulnerabilidades críticas
[ ] Documentación actualizada
```

---

## 🆘 Contactos de Emergencia

### En caso de incidente de seguridad:
1. Detener la aplicación si es necesario
2. Revisar logs de auditoría
3. Identificar el alcance del incidente
4. Notificar al equipo de seguridad
5. Documentar el incidente
6. Implementar correcciones
7. Realizar post-mortem

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Mantenedor:** Equipo de Desarrollo MICASA
