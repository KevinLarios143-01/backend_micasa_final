import { Router } from 'express';
import { permisosController } from '../controllers/permisos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreatePermisoSchema, UpdatePermisoSchema } from '../validators/permisos.validator';

const router = Router();

/**
 * @swagger
 * /api/permisos:
 *   get:
 *     summary: Obtener lista de permisos
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lista de permisos con paginación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, requirePermission('PERMISOS_READ'), permisosController.getAll);

/**
 * @swagger
 * /api/permisos/modulo/{modulo}:
 *   get:
 *     summary: Obtener permisos por módulo
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modulo
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del módulo (ej. PERSONAS, USUARIOS, ROLES)
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
 *         description: Lista de permisos activos del módulo
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/modulo/:modulo', authMiddleware, requirePermission('PERMISOS_READ'), permisosController.getByModule);

/**
 * @swagger
 * /api/permisos/{id}:
 *   get:
 *     summary: Obtener permiso por ID
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_READ
 *       404:
 *         description: Permiso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, requirePermission('PERMISOS_READ'), permisosController.getById);

/**
 * @swagger
 * /api/permisos:
 *   post:
 *     summary: Crear nuevo permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - modulo
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del permiso en formato MODULO_ACCION (debe ser único)
 *               descripcion:
 *                 type: string
 *                 description: Descripción del permiso
 *               modulo:
 *                 type: string
 *                 description: Módulo al que pertenece el permiso
 *               estado:
 *                 type: boolean
 *                 default: true
 *           example:
 *             nombre: "PERSONAS_CREATE"
 *             descripcion: "Permiso para crear personas"
 *             modulo: "PERSONAS"
 *             estado: true
 *     responses:
 *       201:
 *         description: Permiso creado exitosamente
 *       400:
 *         description: Error de validación - Formato de nombre inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_CREATE
 *       409:
 *         description: Conflicto - Nombre de permiso duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, requirePermission('PERMISOS_CREATE'), validate(CreatePermisoSchema), permisosController.create);

/**
 * @swagger
 * /api/permisos/{id}:
 *   put:
 *     summary: Actualizar permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               modulo:
 *                 type: string
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Permiso actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_UPDATE
 *       404:
 *         description: Permiso no encontrado
 *       409:
 *         description: Conflicto - Nombre de permiso duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, requirePermission('PERMISOS_UPDATE'), validate(UpdatePermisoSchema), permisosController.update);

/**
 * @swagger
 * /api/permisos/{id}:
 *   delete:
 *     summary: Eliminar permiso (soft delete)
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso PERMISOS_DELETE
 *       404:
 *         description: Permiso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, requirePermission('PERMISOS_DELETE'), permisosController.delete);

export default router;
