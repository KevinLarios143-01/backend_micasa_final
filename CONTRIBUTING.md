# Guía de Contribución - MICASA Backend

¡Gracias por tu interés en contribuir al proyecto MICASA Backend! Esta guía te ayudará a entender nuestras convenciones y procesos para mantener un código de alta calidad.

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Cómo Contribuir](#-cómo-contribuir)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Convenciones de Código](#-convenciones-de-código)
- [Convenciones de Commits](#-convenciones-de-commits)
- [Proceso de Pull Request](#-proceso-de-pull-request)
- [Guías de Estilo](#-guías-de-estilo)
- [Testing](#-testing)
- [Documentación](#-documentación)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🤝 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un issue con:

- **Título descriptivo**: Resume el problema en una línea
- **Descripción detallada**: Explica qué esperabas y qué obtuviste
- **Pasos para reproducir**: Lista los pasos exactos para reproducir el bug
- **Entorno**: Versión de Node.js, sistema operativo, etc.
- **Logs relevantes**: Incluye mensajes de error o logs

### Sugerir Mejoras

Para sugerir nuevas características:

1. Verifica que no exista un issue similar
2. Abre un issue describiendo:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en el sistema existente

### Contribuir Código

1. **Fork** el repositorio
2. **Crea una rama** desde `main` con un nombre descriptivo
3. **Implementa** tus cambios siguiendo las convenciones
4. **Escribe tests** para tu código
5. **Ejecuta tests** y verifica que pasen
6. **Documenta** tus cambios
7. **Envía** un Pull Request

## 🛠️ Configuración del Entorno

### Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd micasa-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Ejecutar seeds (opcional)
npm run prisma:seed

# Iniciar en modo desarrollo
npm run dev
```

### Verificación

```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar formato
npm run format
```

## 💻 Convenciones de Código

### TypeScript

Este proyecto usa **TypeScript estricto**. Configuración en `tsconfig.json`:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Reglas importantes:**

- ✅ Siempre define tipos explícitos para parámetros de función
- ✅ Usa interfaces para objetos complejos
- ✅ Evita `any`, usa `unknown` si es necesario
- ✅ Usa tipos de retorno explícitos en funciones públicas
- ❌ No uses `@ts-ignore` sin justificación

**Ejemplo:**

```typescript
// ✅ Correcto
async function getPersona(id: number): Promise<Persona | null> {
  return await prisma.personas.findUnique({ where: { id_persona: id } });
}

// ❌ Incorrecto
async function getPersona(id) {
  return await prisma.personas.findUnique({ where: { id_persona: id } });
}
```

### ESLint

El proyecto usa ESLint para mantener calidad de código. Aunque no hay archivo de configuración explícito, seguimos estas reglas:

**Ejecutar linting:**

```bash
# Verificar errores
npm run lint

# Corregir automáticamente
npm run lint:fix
```

**Reglas clave:**

- Sin variables no usadas
- Sin imports no usados
- Usar `const` por defecto, `let` solo cuando sea necesario
- No usar `var`
- Preferir arrow functions para callbacks
- Usar template literals en lugar de concatenación

### Prettier

El proyecto usa Prettier para formateo consistente.

**Ejecutar formateo:**

```bash
npm run format
```

**Configuración implícita:**

- **Indentación**: 2 espacios
- **Comillas**: Simples (`'`)
- **Punto y coma**: Requerido
- **Trailing commas**: ES5
- **Ancho de línea**: 100 caracteres
- **Saltos de línea**: LF (Unix)

**Ejemplo:**

```typescript
// ✅ Correcto
const user = {
  id: 1,
  name: 'Juan',
  email: 'juan@example.com',
};

// ❌ Incorrecto
const user = {
    id: 1,
    name: "Juan",
    email: "juan@example.com"
}
```

### Estructura de Archivos

Sigue la arquitectura en capas del proyecto:

```
src/
├── config/         # Configuraciones (DB, JWT, Swagger)
├── controllers/    # Controladores (manejo de requests)
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── middlewares/    # Middlewares personalizados
├── validators/     # Esquemas de validación Zod
├── types/          # Tipos TypeScript
└── utils/          # Utilidades
```

**Convenciones de nombres:**

- **Archivos**: `kebab-case.ts` (ej: `personas.service.ts`)
- **Clases**: `PascalCase` (ej: `PersonasService`)
- **Funciones/Variables**: `camelCase` (ej: `getPersonaById`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `BCRYPT_ROUNDS`)
- **Interfaces**: `PascalCase` con prefijo `I` opcional (ej: `IPersona` o `Persona`)
- **Types**: `PascalCase` (ej: `AuthResult`)

### Patrones de Código

#### Controladores

```typescript
class PersonasController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extraer parámetros
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Llamar al servicio
      const result = await personasService.getAll(page, limit);

      // Responder con formato estándar
      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
      });
    } catch (error) {
      next(error); // Pasar al error handler
    }
  }
}
```

**Reglas:**

- Siempre usar `try-catch` y pasar errores a `next()`
- Extraer y validar parámetros al inicio
- Usar formato de respuesta estándar: `{success, data?, error?, metadata?}`
- Retornar códigos HTTP apropiados (200, 201, 400, 401, 403, 404, 409, 500)

#### Servicios

```typescript
class PersonasService {
  async getById(id: number): Promise<Persona | null> {
    const persona = await prisma.personas.findUnique({
      where: { id_persona: id },
    });

    return persona;
  }

  async create(data: CreatePersonaDTO, userId?: number): Promise<Persona> {
    // Validar datos
    if (!data.primer_nombre || !data.primer_apellido) {
      throw new Error('Nombre y apellido son requeridos');
    }

    // Crear registro
    const persona = await prisma.personas.create({
      data: {
        ...data,
        fecha_creacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    // Registrar auditoría
    await auditoriaService.log(
      'personas',
      persona.id_persona,
      'INSERT',
      null,
      persona,
      userId
    );

    return persona;
  }
}
```

**Reglas:**

- Lógica de negocio en servicios, no en controladores
- Validar datos antes de operaciones de BD
- Registrar auditoría para INSERT, UPDATE, DELETE
- Usar transacciones para operaciones múltiples
- Lanzar errores descriptivos

#### Validadores

```typescript
import { z } from 'zod';

export const CreatePersonaSchema = z.object({
  primer_nombre: z.string().min(1).max(50),
  primer_apellido: z.string().min(1).max(50),
  genero: z.enum(['M', 'F']),
  email: z.string().email().optional(),
  fecha_nacimiento: z.coerce.date(),
});

export type CreatePersonaDTO = z.infer<typeof CreatePersonaSchema>;
```

**Reglas:**

- Usar Zod para todos los esquemas de validación
- Exportar tipos inferidos con `z.infer`
- Validar tipos, longitudes, formatos y reglas de negocio
- Mensajes de error descriptivos

### Manejo de Errores

```typescript
// Lanzar errores descriptivos
throw new Error('Persona no encontrada');

// Errores de validación
if (!data.identificacion) {
  throw new Error('Identificación es requerida');
}

// Errores de Prisma se manejan en error.middleware.ts
// P2002 -> 409 (Unicidad)
// P2025 -> 404 (No encontrado)
```

### Base de Datos

**Prisma:**

```typescript
// ✅ Usar include para eager loading
const user = await prisma.usuarios.findUnique({
  where: { id_usuario: id },
  include: {
    persona: true,
    usuarios_roles: {
      include: { roles: true },
    },
  },
});

// ✅ Usar transacciones para operaciones múltiples
await prisma.$transaction([
  prisma.personas.create({ data: personaData }),
  prisma.auditoria.create({ data: auditData }),
]);

// ✅ Usar agregaciones para estadísticas
const stats = await prisma.asistencias_eventos.aggregate({
  where: { id_evento: eventId },
  _count: { id_asistencia: true },
  _sum: { asistio: true },
});
```

## 📝 Convenciones de Commits

Usamos **Conventional Commits** para mensajes de commit claros y consistentes.

### Formato

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan el código)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento
- **ci**: Cambios en CI/CD
- **build**: Cambios en build o dependencias

### Alcance (opcional)

El módulo afectado: `auth`, `personas`, `usuarios`, `roles`, `eventos`, etc.

### Ejemplos

```bash
# Nueva característica
git commit -m "feat(personas): agregar búsqueda por nombre"

# Corrección de bug
git commit -m "fix(auth): corregir validación de token expirado"

# Documentación
git commit -m "docs: actualizar README con instrucciones de instalación"

# Refactorización
git commit -m "refactor(services): extraer lógica de auditoría a servicio separado"

# Tests
git commit -m "test(personas): agregar property tests para validación de fechas"

# Múltiples líneas
git commit -m "feat(eventos): agregar estadísticas de asistencia

- Implementar cálculo de porcentaje
- Agregar filtros por ministerio y fecha
- Usar agregaciones de BD para rendimiento"
```

### Reglas

- ✅ Usar presente imperativo: "agregar" no "agregado" ni "agrega"
- ✅ Primera letra en minúscula
- ✅ Sin punto final
- ✅ Descripción concisa (máximo 72 caracteres)
- ✅ Cuerpo opcional para explicar el "qué" y "por qué"
- ✅ Un commit por cambio lógico

## 🔄 Proceso de Pull Request

### Antes de Crear el PR

1. **Actualiza tu rama** con los últimos cambios de `main`:

```bash
git checkout main
git pull origin main
git checkout tu-rama
git rebase main
```

2. **Ejecuta todos los tests**:

```bash
npm test
```

3. **Verifica linting y formato**:

```bash
npm run lint
npm run format
```

4. **Verifica que el servidor inicie**:

```bash
npm run dev
```

### Crear el Pull Request

1. **Push** tu rama al repositorio:

```bash
git push origin tu-rama
```

2. **Abre un PR** en GitHub/GitLab con:

**Título**: Sigue convenciones de commits

```
feat(personas): agregar búsqueda por nombre
```

**Descripción**: Usa esta plantilla

```markdown
## Descripción

Breve descripción de los cambios realizados.

## Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva característica (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación
- [ ] Refactorización
- [ ] Tests

## ¿Cómo se ha probado?

Describe las pruebas realizadas:
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas manuales

## Checklist

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado código complejo cuando es necesario
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi cambio
- [ ] Todos los tests nuevos y existentes pasan
- [ ] He actualizado el CHANGELOG (si aplica)

## Issues Relacionados

Cierra #123
Relacionado con #456
```

### Revisión del PR

Tu PR será revisado considerando:

- ✅ **Funcionalidad**: ¿Resuelve el problema correctamente?
- ✅ **Código**: ¿Sigue las convenciones y mejores prácticas?
- ✅ **Tests**: ¿Tiene cobertura adecuada?
- ✅ **Documentación**: ¿Está actualizada?
- ✅ **Rendimiento**: ¿No introduce problemas de rendimiento?
- ✅ **Seguridad**: ¿No introduce vulnerabilidades?

### Después de la Revisión

- Responde a comentarios de manera constructiva
- Realiza cambios solicitados en commits adicionales
- Solicita re-revisión cuando esté listo
- Una vez aprobado, el PR será merged por un maintainer

## 🎨 Guías de Estilo

### Comentarios

```typescript
// ✅ Comentarios útiles que explican el "por qué"
// Usamos bcrypt con factor 10 para balance entre seguridad y rendimiento
const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

// ✅ Comentarios para lógica compleja
// Extraer permisos únicos de todos los roles activos del usuario
const permissions = user.usuarios_roles
  .filter((ur) => ur.estado && ur.roles.estado)
  .flatMap((ur) =>
    ur.roles.roles_permisos
      .filter((rp) => rp.estado && rp.permisos.estado)
      .map((rp) => rp.permisos.nombre)
  );

// ❌ Comentarios obvios
// Crear usuario
const user = await prisma.usuarios.create({ data });
```

### Documentación JSDoc

Para funciones públicas y APIs:

```typescript
/**
 * Obtiene una persona por su ID
 * @param id - ID de la persona
 * @returns Persona encontrada o null si no existe
 * @throws Error si el ID es inválido
 */
async getById(id: number): Promise<Persona | null> {
  // ...
}
```

### Swagger/OpenAPI

Documenta todos los endpoints:

```typescript
/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Listar personas
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Lista de personas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/', authMiddleware, requirePermission('PERSONAS_READ'), personasController.getAll);
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test -- personas.test.ts

# Con cobertura
npm test -- --coverage

# Modo watch
npm run test:watch
```

### Escribir Tests

#### Tests Unitarios

```typescript
import { personasService } from '../services/personas.service';

describe('PersonasService', () => {
  describe('getById', () => {
    it('debe retornar persona cuando existe', async () => {
      const persona = await personasService.getById(1);
      expect(persona).toBeDefined();
      expect(persona?.id_persona).toBe(1);
    });

    it('debe retornar null cuando no existe', async () => {
      const persona = await personasService.getById(99999);
      expect(persona).toBeNull();
    });
  });
});
```

#### Property-Based Tests

```typescript
import fc from 'fast-check';

describe('Paginación', () => {
  it('debe respetar límite máximo de 100', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (limit) => {
        const validLimit = Math.min(100, Math.max(1, limit));
        expect(validLimit).toBeLessThanOrEqual(100);
        expect(validLimit).toBeGreaterThanOrEqual(1);
      })
    );
  });
});
```

### Cobertura de Tests

Objetivo: **>= 80%** de cobertura

```bash
npm test -- --coverage
```

Prioriza tests para:
- Lógica de negocio crítica
- Validaciones
- Cálculos y transformaciones
- Casos edge

## 📚 Documentación

### Actualizar Documentación

Cuando hagas cambios, actualiza:

- **README.md**: Si cambias instalación, configuración o uso
- **ARCHITECTURE.md**: Si cambias arquitectura o flujos
- **Swagger**: Si agregas/modificas endpoints
- **Comentarios en código**: Para lógica compleja

### Crear Nueva Documentación

Para características importantes, crea documentos en `docs/`:

```
docs/
├── ARCHITECTURE.md
├── JWT_PERMISSIONS_CACHE.md
├── DATABASE_OPTIMIZATION.md
└── TU_NUEVA_FEATURE.md
```

## ✅ Checklist Antes de Commit

Antes de hacer commit, verifica:

```bash
# 1. Tests pasan
npm test

# 2. Linting correcto
npm run lint

# 3. Formato correcto
npm run format

# 4. Servidor inicia
npm run dev

# 5. Swagger actualizado (si aplica)
# Visita http://localhost:3000/api-docs
```

## 🚀 Flujo de Trabajo Completo

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear rama
git checkout -b feat/mi-nueva-caracteristica

# 3. Hacer cambios
# ... editar archivos ...

# 4. Ejecutar tests
npm test

# 5. Verificar calidad
npm run lint
npm run format

# 6. Commit
git add .
git commit -m "feat(modulo): descripción del cambio"

# 7. Push
git push origin feat/mi-nueva-caracteristica

# 8. Crear Pull Request
# Ir a GitHub/GitLab y crear PR

# 9. Esperar revisión y merge
```

## 🆘 Ayuda

Si tienes dudas:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Pregunta en el issue relacionado
4. Abre un nuevo issue con la etiqueta "question"

## 📞 Contacto

Para preguntas o sugerencias sobre esta guía:

- Abre un issue con la etiqueta "documentation"
- Propón cambios mediante Pull Request

---

¡Gracias por contribuir a MICASA Backend! 🙏
