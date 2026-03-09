# Optimización de Base de Datos - Sistema MICASA

## Resumen

Este documento detalla las optimizaciones implementadas en la base de datos para mejorar el rendimiento del sistema MICASA, cumpliendo con los requisitos 20.1, 20.2 y 20.3.

## Índices Implementados

### 1. Índices en Campos de Búsqueda Frecuente

#### Tabla `personas`
- **`identificacion`**: Índice único para búsquedas rápidas por documento de identidad
- **`(primer_nombre, primer_apellido)`**: Índice compuesto para búsquedas por nombre completo

#### Tabla `usuarios`
- **`usuario`**: Índice único para búsquedas rápidas por nombre de usuario
- **`id_persona`**: Índice único para relación uno a uno con personas

### 2. Índices en Claves Foráneas

Todas las claves foráneas del sistema tienen índices para optimizar las operaciones JOIN:

#### Tabla `usuarios`
- **`id_persona`**: FK hacia `personas`

#### Tabla `usuarios_roles`
- **`id_usuario`**: FK hacia `usuarios`
- **`id_rol`**: FK hacia `roles`

#### Tabla `roles_permisos`
- **`id_rol`**: FK hacia `roles`
- **`id_permiso`**: FK hacia `permisos`

#### Tabla `ministerio`
- **`lider_id`**: FK hacia `personas` (agregado en esta optimización)

#### Tabla `ministerio_persona`
- **`id_persona`**: FK hacia `personas`
- **`id_ministerio`**: FK hacia `ministerio`

#### Tabla `familia_persona`
- **`id_persona`**: FK hacia `personas`
- **`id_familia`**: FK hacia `familia`

#### Tabla `contactos`
- **`id_persona`**: FK hacia `personas`

#### Tabla `eventos`
- **`fecha_inicio`**: Índice para búsquedas por rango de fechas
- **`id_ministerio`**: FK hacia `ministerio`

#### Tabla `asistencia_eventos`
- **`id_evento`**: FK hacia `eventos`
- **`id_persona`**: FK hacia `personas`

#### Tabla `auditoria`
- **`tabla`**: Índice para filtrar por tabla
- **`id_usuario`**: FK hacia `usuarios`
- **`fecha_accion`**: Índice para búsquedas por rango de fechas

## Eager Loading (Prevención de N+1 Queries)

### Implementación en Servicios

Todos los servicios utilizan `include` de Prisma para cargar relaciones de forma eficiente:

#### 1. **AuthService**
```typescript
const user = await prisma.usuarios.findUnique({
  where: { usuario },
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
```

#### 2. **UsuariosService**
```typescript
const user = await prisma.usuarios.findUnique({
  where: { id_usuario: id },
  include: {
    persona: true,
    usuarios_roles: {
      where: { estado: true },
      include: {
        roles: {
          where: { estado: true }
        }
      }
    }
  }
});
```

#### 3. **EventosService**
```typescript
const evento = await prisma.eventos.findFirst({
  where: { id_evento: id, estado: true },
  include: {
    ministerio: true,
    asistencia_eventos: {
      include: {
        persona: true
      }
    }
  }
});
```

#### 4. **AsistenciasService**
```typescript
// Optimización para evitar N+1 en registro masivo de asistencias
const personaIds = asistencias.map(a => a.id_persona);
const personas = await prisma.personas.findMany({
  where: {
    id_persona: { in: personaIds },
    estado: true,
  }
});

// Obtener registros existentes en una sola query
const existentes = await prisma.asistencia_eventos.findMany({
  where: {
    id_evento: eventoId,
    id_persona: { in: personaIds },
  },
});
```

#### 5. **MinisteriosService**
```typescript
const ministerio = await prisma.ministerio.findFirst({
  where: { id_ministerio: id, estado: true },
  include: {
    lider: true,
    ministerio_persona: {
      where: { estado: true },
      include: {
        persona: true
      }
    }
  }
});
```

#### 6. **ContactosService**
```typescript
const contacto = await prisma.contactos.findFirst({
  where: { id_contacto: id, estado: true },
  include: {
    persona: {
      select: {
        id_persona: true,
        primer_nombre: true,
        primer_apellido: true,
        email: true,
      }
    }
  }
});
```

## Agregaciones de Base de Datos

### Estadísticas de Asistencia

Las estadísticas se calculan usando agregaciones nativas de PostgreSQL a través de Prisma:

```typescript
const [total, asistieron] = await Promise.all([
  prisma.asistencia_eventos.count({ where: whereClause }),
  prisma.asistencia_eventos.count({
    where: {
      ...whereClause,
      asistio: true,
    },
  }),
]);

const porcentaje = total > 0 ? (asistieron / total) * 100 : 0;
```

**Beneficios:**
- Cálculos realizados en la base de datos (más rápido)
- Menor transferencia de datos entre DB y aplicación
- Escalable para grandes volúmenes de datos

## Paginación Obligatoria

Todos los endpoints de listado implementan paginación con límite máximo de 100 registros:

```typescript
const skip = (page - 1) * limit;
const maxLimit = Math.min(limit, 100);

const [data, total] = await Promise.all([
  prisma.model.findMany({
    where: filters,
    skip,
    take: maxLimit,
    include: { /* relaciones */ }
  }),
  prisma.model.count({ where: filters })
]);
```

## Mejoras de Rendimiento Implementadas

### 1. Batch Queries
- Uso de `Promise.all()` para ejecutar queries en paralelo
- Reducción del tiempo total de respuesta

### 2. Select Específico
- Uso de `select` para traer solo los campos necesarios
- Reducción del tamaño de las respuestas

### 3. Índices Compuestos
- `(primer_nombre, primer_apellido)` en personas
- `(id_usuario, id_rol)` en usuarios_roles
- `(id_rol, id_permiso)` en roles_permisos

### 4. Prepared Statements
- Prisma usa prepared statements automáticamente
- Protección contra SQL injection
- Mejor rendimiento en queries repetitivas

## Validación de Optimizaciones

### Comandos para Verificar Índices

```sql
-- Ver todos los índices de una tabla
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'personas';

-- Ver uso de índices en una query
EXPLAIN ANALYZE 
SELECT * FROM personas 
WHERE identificacion = '12345678';
```

### Métricas Esperadas

Con las optimizaciones implementadas:
- **Búsqueda por identificación**: < 5ms
- **Búsqueda por nombre**: < 10ms
- **Listado paginado**: < 50ms
- **Estadísticas de asistencia**: < 100ms
- **Login con permisos**: < 100ms

## Recomendaciones Adicionales

### Para Producción

1. **Connection Pooling**: Configurar pool de conexiones en Prisma
   ```typescript
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     connection_limit = 10
   }
   ```

2. **Query Logging**: Habilitar logs de queries lentas
   ```typescript
   const prisma = new PrismaClient({
     log: [
       { level: 'query', emit: 'event' },
       { level: 'warn', emit: 'stdout' },
       { level: 'error', emit: 'stdout' },
     ],
   });
   
   prisma.$on('query', (e) => {
     if (e.duration > 100) {
       console.warn(`Slow query (${e.duration}ms): ${e.query}`);
     }
   });
   ```

3. **Caching**: Implementar Redis para cachear:
   - Permisos de usuario (ya están en JWT)
   - Listas de roles y permisos
   - Estadísticas frecuentes

4. **Monitoreo**: Usar herramientas como:
   - pgAdmin para análisis de queries
   - New Relic o DataDog para APM
   - Prisma Studio para debugging

## Conclusión

Las optimizaciones implementadas cumplen con todos los requisitos especificados:

✅ **Requisito 20.1**: Índices en campos de búsqueda frecuente (identificacion, nombres, usuario)
✅ **Requisito 20.2**: Índices en todas las claves foráneas
✅ **Requisito 20.3**: Eager loading con include para evitar N+1 queries

El sistema está optimizado para manejar eficientemente operaciones de lectura y escritura, con especial atención a las consultas más frecuentes y las relaciones entre tablas.
