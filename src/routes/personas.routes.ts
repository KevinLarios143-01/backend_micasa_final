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
 *     description: Retorna una lista paginada de personas registradas en el sistema. Permite filtrar por estado activo/inactivo.
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Registros por página (máximo 100)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo (true) o inactivo (false)
 *     responses:
 *       200:
 *         description: Lista de personas con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: No autenticado - Token JWT inválido o ausente
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.getAll
);

/**
 * @swagger
 * /api/personas/search:
 *   get:
 *     summary: Buscar personas por nombre
 *     description: Busca personas por coincidencia en primer_nombre, segundo_nombre, tercer_nombre, primer_apellido o segundo_apellido
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Término de búsqueda (busca en todos los campos de nombre)
 *         example: "Juan"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Resultados de búsqueda con paginación
 *       400:
 *         description: Error de validación - Término de búsqueda requerido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/search',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.search
);

/**
 * @swagger
 * /api/personas/identificacion/{identificacion}:
 *   get:
 *     summary: Buscar persona por número de identificación
 *     description: Busca una persona por su número de identificación único
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identificacion
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de identificación de la persona
 *         example: "1234567890"
 *     responses:
 *       200:
 *         description: Persona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_READ
 *       404:
 *         description: Persona no encontrada con esa identificación
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/identificacion/:identificacion',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.getByIdentificacion
);

/**
 * @swagger
 * /api/personas/{id}:
 *   get:
 *     summary: Obtener persona por ID
 *     description: Retorna los datos completos de una persona específica por su ID
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *         example: 1
 *     responses:
 *       200:
 *         description: Persona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_persona:
 *                       type: integer
 *                     primer_nombre:
 *                       type: string
 *                     segundo_nombre:
 *                       type: string
 *                     tercer_nombre:
 *                       type: string
 *                     primer_apellido:
 *                       type: string
 *                     segundo_apellido:
 *                       type: string
 *                     fecha_nacimiento:
 *                       type: string
 *                       format: date
 *                     genero:
 *                       type: string
 *                       enum: [M, F]
 *                     bautizado:
 *                       type: boolean
 *                     fecha_bautizo:
 *                       type: string
 *                       format: date
 *                     identificacion:
 *                       type: string
 *                     tipo_identificacion:
 *                       type: string
 *                       enum: [CC, TI, CE, PAS, RC]
 *                     estado_civil:
 *                       type: string
 *                       enum: [S, C, V, D, U]
 *                     celular:
 *                       type: string
 *                     email:
 *                       type: string
 *                     direccion:
 *                       type: string
 *                     estado:
 *                       type: boolean
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_READ
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_READ'),
  personasController.getById
);

/**
 * @swagger
 * /api/personas:
 *   post:
 *     summary: Crear nueva persona
 *     description: Crea un nuevo registro de persona en el sistema. La identificación debe ser única. Si bautizado es true, fecha_bautizo debe ser posterior a fecha_nacimiento.
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - primer_nombre
 *               - primer_apellido
 *               - fecha_nacimiento
 *               - genero
 *               - identificacion
 *               - tipo_identificacion
 *               - estado_civil
 *             properties:
 *               primer_nombre:
 *                 type: string
 *                 maxLength: 50
 *               segundo_nombre:
 *                 type: string
 *                 maxLength: 50
 *               tercer_nombre:
 *                 type: string
 *                 maxLength: 50
 *               primer_apellido:
 *                 type: string
 *                 maxLength: 50
 *               segundo_apellido:
 *                 type: string
 *                 maxLength: 50
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               genero:
 *                 type: string
 *                 enum: [M, F]
 *               bautizado:
 *                 type: boolean
 *                 default: false
 *               fecha_bautizo:
 *                 type: string
 *                 format: date
 *               identificacion:
 *                 type: string
 *               tipo_identificacion:
 *                 type: string
 *                 enum: [CC, TI, CE, PAS, RC]
 *               estado_civil:
 *                 type: string
 *                 enum: [S, C, V, D, U]
 *               celular:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               direccion:
 *                 type: string
 *           example:
 *             primer_nombre: "Juan"
 *             segundo_nombre: "Carlos"
 *             primer_apellido: "Pérez"
 *             segundo_apellido: "García"
 *             fecha_nacimiento: "1990-05-15"
 *             genero: "M"
 *             bautizado: true
 *             fecha_bautizo: "2000-08-20"
 *             identificacion: "1234567890"
 *             tipo_identificacion: "CC"
 *             estado_civil: "C"
 *             celular: "3001234567"
 *             email: "juan.perez@example.com"
 *             direccion: "Calle 123 #45-67"
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *       400:
 *         description: Error de validación - Datos inválidos o fecha_bautizo anterior a fecha_nacimiento
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_CREATE
 *       409:
 *         description: Conflicto - Identificación duplicada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('PERSONAS_CREATE'),
  validate(CreatePersonaSchema),
  personasController.create
);

/**
 * @swagger
 * /api/personas/{id}:
 *   put:
 *     summary: Actualizar persona
 *     description: Actualiza los datos de una persona existente. Todos los campos son opcionales. Si se actualiza identificación, debe ser única. Si se actualiza fecha_bautizo, debe ser posterior a fecha_nacimiento.
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primer_nombre:
 *                 type: string
 *               segundo_nombre:
 *                 type: string
 *               tercer_nombre:
 *                 type: string
 *               primer_apellido:
 *                 type: string
 *               segundo_apellido:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               genero:
 *                 type: string
 *                 enum: [M, F]
 *               bautizado:
 *                 type: boolean
 *               fecha_bautizo:
 *                 type: string
 *                 format: date
 *               identificacion:
 *                 type: string
 *               tipo_identificacion:
 *                 type: string
 *                 enum: [CC, TI, CE, PAS, RC]
 *               estado_civil:
 *                 type: string
 *                 enum: [S, C, V, D, U]
 *               celular:
 *                 type: string
 *               email:
 *                 type: string
 *               direccion:
 *                 type: string
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Persona actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_UPDATE
 *       404:
 *         description: Persona no encontrada
 *       409:
 *         description: Conflicto - Identificación duplicada
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_UPDATE'),
  validate(UpdatePersonaSchema),
  personasController.update
);

/**
 * @swagger
 * /api/personas/{id}:
 *   delete:
 *     summary: Eliminar persona (soft delete)
 *     description: Realiza una eliminación lógica de la persona estableciendo su estado a false. El registro permanece en la base de datos pero se marca como inactivo.
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona eliminada exitosamente (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Persona eliminada exitosamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERSONAS_DELETE
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('PERSONAS_DELETE'),
  personasController.delete
);

export default router;
