# Rate Limiting - API MICASA

Esta guía documenta los límites de tasa (rate limiting) implementados en la API MICASA para proteger el sistema contra abuso y garantizar disponibilidad para todos los usuarios.

## Tabla de Contenidos

- [¿Qué es Rate Limiting?](#qué-es-rate-limiting)
- [Límites Configurados](#límites-configurados)
- [Cómo Funciona](#cómo-funciona)
- [Headers de Respuesta](#headers-de-respuesta)
- [Manejo de Errores](#manejo-de-errores)
- [Mejores Prácticas](#mejores-prácticas)
- [Estrategias de Implementación](#estrategias-de-implementación)

## ¿Qué es Rate Limiting?

Rate limiting es una técnica que limita el número de solicitudes que un cliente puede hacer a la API en un período de tiempo determinado. Esto ayuda a:

- **Prevenir abuso**: Protege contra ataques de fuerza bruta y spam
- **Garantizar disponibilidad**: Asegura que el sistema esté disponible para todos los usuarios
- **Optimizar recursos**: Previene sobrecarga del servidor
- **Mejorar seguridad**: Dificulta ataques automatizados

## Límites Configurados

La API MICASA implementa dos niveles de rate limiting:

### 1. Rate Limiting General

**Aplica a:** Todos los endpoints (excepto login que tiene su propio límite)

**Límite:** 100 requests por minuto por dirección IP

**Ventana de tiempo:** 60 segundos (1 minuto)

**Endpoints afectados:**
- `/api/personas/*`
- `/api/usuarios/*`
- `/api/roles/*`
- `/api/permisos/*`
- `/api/ministerios/*`
- `/api/familias/*`
- `/api/contactos/*`
- `/api/eventos/*`
- `/api/auditoria/*`
- `/api/auth/me`
- `/api/auth/logout`
- `/api/auth/change-password`
- `/api/auth/refresh`

### 2. Rate Limiting de Login

**Aplica a:** Endpoint de autenticación

**Límite:** 5 requests por minuto por dirección IP

**Ventana de tiempo:** 60 segundos (1 minuto)

**Endpoints afectados:**
- `/api/auth/login`

**Razón:** Protección contra ataques de fuerza bruta en credenciales

## Cómo Funciona

### Identificación del Cliente

El rate limiting se aplica por **dirección IP del cliente**. Cada IP tiene su propio contador independiente.

```
IP: 192.168.1.100 → Contador: 45/100 requests
IP: 192.168.1.101 → Contador: 12/100 requests
```

### Ventana Deslizante

El sistema usa una ventana deslizante de 60 segundos:

```
Tiempo: 10:00:00 → Request 1
Tiempo: 10:00:15 → Request 2
Tiempo: 10:00:30 → Request 3
...
Tiempo: 10:01:00 → Request 1 expira, contador se reduce
```

### Reinicio del Contador

El contador se reinicia automáticamente después de 60 segundos desde la primera solicitud en la ventana actual.

**Ejemplo:**
```
10:00:00 - Request 1 (contador: 1/100)
10:00:30 - Request 2 (contador: 2/100)
10:01:00 - Contador se reinicia (contador: 0/100)
```

## Headers de Respuesta

Cuando se aplica rate limiting, la API incluye headers informativos en la respuesta:

### Headers Estándar

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

**Descripción:**
- `X-RateLimit-Limit`: Número máximo de requests permitidos en la ventana
- `X-RateLimit-Remaining`: Número de requests restantes en la ventana actual
- `X-RateLimit-Reset`: Timestamp Unix cuando se reinicia el contador

### Ejemplo de Respuesta Exitosa

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678

{
  "success": true,
  "data": [...]
}
```

### Ejemplo de Respuesta con Límite Excedido

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642345678
Retry-After: 45

{
  "success": false,
  "error": "Demasiadas solicitudes. Por favor, intente más tarde."
}
```

**Header adicional:**
- `Retry-After`: Segundos que debe esperar antes de reintentar

## Manejo de Errores

### Error 429 - Too Many Requests

Cuando se excede el límite, la API retorna:

**Código HTTP:** 429

**Respuesta:**
```json
{
  "success": false,
  "error": "Demasiadas solicitudes. Por favor, intente más tarde."
}
```

### Qué Hacer al Recibir 429

1. **Leer el header `Retry-After`**: Indica cuántos segundos esperar
2. **Esperar el tiempo indicado**: No reintentar inmediatamente
3. **Implementar backoff exponencial**: Aumentar el tiempo de espera en cada reintento
4. **Revisar la lógica del cliente**: Reducir la frecuencia de solicitudes

## Mejores Prácticas

### 1. Monitorear Headers de Rate Limit

Siempre revisar los headers `X-RateLimit-*` para saber cuántas solicitudes quedan:

```javascript
// Ejemplo en JavaScript
const response = await fetch('/api/personas', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const remaining = response.headers.get('X-RateLimit-Remaining');
const limit = response.headers.get('X-RateLimit-Limit');

console.log(`Requests restantes: ${remaining}/${limit}`);

if (remaining < 10) {
  console.warn('Acercándose al límite de rate limiting');
}
```

### 2. Implementar Caché en el Cliente

Cachear respuestas para reducir solicitudes innecesarias:

```javascript
// Ejemplo de caché simple
const cache = new Map();
const CACHE_TTL = 60000; // 1 minuto

async function getPersonas() {
  const cacheKey = 'personas';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await fetch('/api/personas');
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

### 3. Implementar Backoff Exponencial

Aumentar el tiempo de espera en cada reintento:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : Math.pow(2, i) * 1000; // Backoff exponencial
        
        console.log(`Rate limit excedido. Esperando ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 4. Agrupar Solicitudes (Batching)

Cuando sea posible, agrupar múltiples operaciones en una sola solicitud:

```javascript
// ❌ Mal: Múltiples solicitudes individuales
for (const persona of personas) {
  await fetch(`/api/personas/${persona.id}`);
}

// ✅ Bien: Una solicitud con paginación
const response = await fetch('/api/personas?limit=100');
```

### 5. Usar Paginación Eficientemente

Solicitar solo los datos necesarios:

```javascript
// ❌ Mal: Solicitar todos los registros
const response = await fetch('/api/personas?limit=100');

// ✅ Bien: Solicitar solo lo necesario
const response = await fetch('/api/personas?limit=10&page=1');
```

### 6. Implementar Queue de Solicitudes

Controlar la tasa de solicitudes desde el cliente:

```javascript
class RequestQueue {
  constructor(maxPerMinute = 90) { // Dejar margen de seguridad
    this.queue = [];
    this.maxPerMinute = maxPerMinute;
    this.requestsInWindow = [];
  }
  
  async enqueue(requestFn) {
    // Limpiar requests antiguos (>60s)
    const now = Date.now();
    this.requestsInWindow = this.requestsInWindow.filter(
      time => now - time < 60000
    );
    
    // Esperar si se alcanzó el límite
    if (this.requestsInWindow.length >= this.maxPerMinute) {
      const oldestRequest = this.requestsInWindow[0];
      const waitTime = 60000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Ejecutar request
    this.requestsInWindow.push(Date.now());
    return await requestFn();
  }
}

// Uso
const queue = new RequestQueue(90);

for (const id of ids) {
  await queue.enqueue(() => 
    fetch(`/api/personas/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  );
}
```

### 7. Manejar Errores Gracefully

Implementar manejo robusto de errores 429:

```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        'Rate limit excedido',
        parseInt(retryAfter) || 60
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Mostrar mensaje al usuario
      showNotification(
        `Demasiadas solicitudes. Espere ${error.retryAfter} segundos.`
      );
    }
    throw error;
  }
}
```

## Estrategias de Implementación

### Para Aplicaciones Web

```javascript
// Implementar interceptor global
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      
      // Mostrar notificación al usuario
      toast.warning(
        `Demasiadas solicitudes. Reintentando en ${retryAfter}s...`
      );
      
      // Esperar y reintentar
      await new Promise(resolve => 
        setTimeout(resolve, retryAfter * 1000)
      );
      
      return axios.request(error.config);
    }
    
    return Promise.reject(error);
  }
);
```

### Para Aplicaciones Móviles

```javascript
// Implementar cola de solicitudes con prioridad
class PriorityRequestQueue {
  constructor() {
    this.highPriority = [];
    this.normalPriority = [];
    this.processing = false;
  }
  
  async add(requestFn, priority = 'normal') {
    const queue = priority === 'high' 
      ? this.highPriority 
      : this.normalPriority;
    
    queue.push(requestFn);
    
    if (!this.processing) {
      await this.process();
    }
  }
  
  async process() {
    this.processing = true;
    
    while (this.highPriority.length > 0 || this.normalPriority.length > 0) {
      const requestFn = this.highPriority.length > 0
        ? this.highPriority.shift()
        : this.normalPriority.shift();
      
      try {
        await requestFn();
        await new Promise(resolve => setTimeout(resolve, 600)); // ~100 req/min
      } catch (error) {
        if (error.status === 429) {
          // Pausar procesamiento
          const retryAfter = error.headers['retry-after'] || 60;
          await new Promise(resolve => 
            setTimeout(resolve, retryAfter * 1000)
          );
        }
      }
    }
    
    this.processing = false;
  }
}
```

### Para Scripts y Automatización

```python
# Python con rate limiting automático
import time
import requests
from functools import wraps

def rate_limited(max_per_minute=90):
    min_interval = 60.0 / max_per_minute
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = min_interval - elapsed
            
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            
            ret = func(*args, **kwargs)
            last_called[0] = time.time()
            return ret
        
        return wrapper
    return decorator

@rate_limited(max_per_minute=90)
def api_request(url, token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 60))
        print(f'Rate limit excedido. Esperando {retry_after}s...')
        time.sleep(retry_after)
        return api_request(url, token)
    
    return response.json()

# Uso
for persona_id in persona_ids:
    data = api_request(f'http://localhost:3000/api/personas/{persona_id}', token)
    process_data(data)
```

## Límites por Tipo de Usuario

Actualmente, todos los usuarios tienen los mismos límites independientemente de su rol. En futuras versiones, se podrían implementar límites diferenciados:

| Tipo de Usuario | Límite General | Límite Login |
|-----------------|----------------|--------------|
| Anónimo | N/A | 5 req/min |
| Usuario Regular | 100 req/min | 5 req/min |
| Administrador | 100 req/min | 5 req/min |
| API Key (futuro) | 1000 req/min | N/A |

## Monitoreo y Alertas

### Logs del Servidor

El servidor registra eventos de rate limiting:

```
[WARN] Rate limit exceeded for IP 192.168.1.100 on endpoint /api/auth/login
[INFO] Rate limit reset for IP 192.168.1.100
```

### Métricas Recomendadas

Para monitorear el uso de la API:

1. **Requests por minuto por IP**: Identificar IPs problemáticas
2. **Tasa de errores 429**: Medir cuántos clientes están siendo limitados
3. **Distribución de requests por endpoint**: Identificar endpoints más usados
4. **Tiempo promedio entre requests**: Detectar patrones de uso

## Preguntas Frecuentes

### ¿Por qué recibo 429 si no he hecho muchas solicitudes?

Posibles causas:
- Múltiples pestañas/ventanas de la aplicación abiertas
- Solicitudes automáticas en segundo plano
- Compartir IP con otros usuarios (NAT, proxy corporativo)
- Caché del navegador deshabilitado

### ¿El rate limiting se aplica por usuario o por IP?

Por **dirección IP**. Todos los usuarios desde la misma IP comparten el mismo límite.

### ¿Puedo solicitar un aumento en el límite?

Contactar al administrador del sistema para evaluar casos especiales. Se recomienda primero optimizar el uso de la API.

### ¿Qué pasa si mi aplicación necesita hacer más de 100 requests por minuto?

Opciones:
1. Implementar caché agresivo en el cliente
2. Usar paginación y filtros para reducir solicitudes
3. Agrupar operaciones cuando sea posible
4. Contactar al administrador para evaluar límites personalizados

### ¿El rate limiting afecta a las solicitudes de lectura y escritura por igual?

Sí, todas las solicitudes cuentan para el límite, independientemente del método HTTP (GET, POST, PUT, DELETE).

## Recursos Adicionales

- [Documentación de la API](./API_USAGE_EXAMPLES.md)
- [Códigos de Error](./API_ERROR_CODES.md)
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Documentación Swagger](http://localhost:3000/api-docs)

## Contacto

Para preguntas sobre rate limiting o solicitudes de límites personalizados, contactar al equipo de desarrollo.
