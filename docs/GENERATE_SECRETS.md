# Guía para Generar Secrets Seguros

Esta guía proporciona instrucciones paso a paso para generar secrets criptográficamente seguros para el sistema MICASA.

---

## 🔐 Generación de JWT Secrets

### Método 1: Usando Node.js (Recomendado)

```bash
# Generar JWT_SECRET (64 caracteres hexadecimales)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar REFRESH_TOKEN_SECRET (64 caracteres hexadecimales)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ejemplo de salida:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Método 2: Usando OpenSSL

```bash
# Generar JWT_SECRET
openssl rand -hex 32

# Generar REFRESH_TOKEN_SECRET
openssl rand -hex 32
```

### Método 3: Usando Python

```bash
# Generar JWT_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generar REFRESH_TOKEN_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 📝 Configuración en .env

Una vez generados los secrets, agrégalos a tu archivo `.env`:

```env
# JWT Secrets - NUNCA compartir estos valores
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
REFRESH_TOKEN_SECRET=f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

---

## ⚠️ Requisitos de Seguridad

### Longitud Mínima
- **Desarrollo:** Sin restricción (pero se recomienda 32+ caracteres)
- **Producción:** Mínimo 32 caracteres (el sistema lo valida automáticamente)

### Valores Prohibidos en Producción
El sistema rechazará automáticamente estos valores en producción:
- `your-super-secret-jwt-key-change-this-in-production`
- `your-refresh-token-secret`
- `secret`
- `password`
- `12345678`

### Características de un Secret Seguro
✅ Al menos 32 caracteres  
✅ Generado aleatoriamente  
✅ Único para cada entorno  
✅ Nunca compartido o versionado  
✅ Diferente para JWT_SECRET y REFRESH_TOKEN_SECRET  

---

## 🔄 Rotación de Secrets

### Cuándo Rotar Secrets
- Cada 90-180 días (recomendado)
- Después de un incidente de seguridad
- Cuando un miembro del equipo con acceso deja la organización
- Si se sospecha que fueron comprometidos

### Proceso de Rotación

1. **Generar nuevos secrets:**
```bash
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEW_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$NEW_JWT_SECRET"
echo "REFRESH_TOKEN_SECRET=$NEW_REFRESH_SECRET"
```

2. **Actualizar configuración:**
   - Actualizar archivo `.env` en el servidor
   - Reiniciar la aplicación

3. **Invalidar tokens existentes:**
   - Todos los usuarios deberán volver a iniciar sesión
   - Los refresh tokens existentes dejarán de funcionar

4. **Comunicar a usuarios:**
   - Notificar que deberán volver a iniciar sesión
   - Explicar que es por seguridad

---

## 🗄️ Almacenamiento Seguro de Secrets

### ❌ NO HACER
- ❌ Guardar secrets en el repositorio Git
- ❌ Compartir secrets por email o chat
- ❌ Usar el mismo secret en múltiples entornos
- ❌ Escribir secrets en documentación pública
- ❌ Usar secrets débiles o predecibles

### ✅ HACER
- ✅ Usar variables de entorno
- ✅ Usar gestores de secrets (AWS Secrets Manager, HashiCorp Vault)
- ✅ Encriptar backups que contengan secrets
- ✅ Limitar acceso a secrets solo a personal autorizado
- ✅ Auditar acceso a secrets

---

## 🔧 Configuración por Entorno

### Desarrollo Local
```env
# .env.development
JWT_SECRET=dev-secret-not-for-production-use-only
REFRESH_TOKEN_SECRET=dev-refresh-secret-not-for-production
```

### Staging
```env
# .env.staging
JWT_SECRET=<generar secret único para staging>
REFRESH_TOKEN_SECRET=<generar secret único para staging>
```

### Producción
```env
# .env.production
JWT_SECRET=<generar secret fuerte único para producción>
REFRESH_TOKEN_SECRET=<generar secret fuerte único para producción>
```

---

## 🛠️ Script de Generación Automática

Puedes crear un script para generar todos los secrets necesarios:

```bash
#!/bin/bash
# generate-secrets.sh

echo "=== Generando Secrets para MICASA Backend ==="
echo ""

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "Copia estos valores a tu archivo .env:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "REFRESH_TOKEN_SECRET=$REFRESH_SECRET"
echo ""
echo "⚠️  IMPORTANTE: Guarda estos valores de forma segura y nunca los compartas."
```

**Uso:**
```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
```

---

## 📋 Checklist de Verificación

Antes de desplegar a producción, verifica:

- [ ] JWT_SECRET tiene al menos 32 caracteres
- [ ] REFRESH_TOKEN_SECRET tiene al menos 32 caracteres
- [ ] Los secrets son diferentes entre sí
- [ ] Los secrets son únicos para este entorno
- [ ] Los secrets no están en el repositorio Git
- [ ] Los secrets están documentados en gestor de secrets
- [ ] El equipo sabe cómo acceder a los secrets de forma segura
- [ ] Existe un plan de rotación de secrets

---

## 🆘 Recuperación de Secrets Perdidos

Si pierdes los secrets de producción:

1. **Generar nuevos secrets inmediatamente**
2. **Actualizar configuración en el servidor**
3. **Reiniciar la aplicación**
4. **Notificar a todos los usuarios** que deberán volver a iniciar sesión
5. **Documentar el incidente**
6. **Revisar procedimientos** para prevenir pérdida futura

---

## 📚 Referencias

- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última actualización:** 2024  
**Versión:** 1.0
