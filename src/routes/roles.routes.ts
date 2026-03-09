import { Router } from 'express';
import { rolesController } from '../controllers/roles.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreateRolSchema, UpdateRolSchema, AssignPermisoSchema } from '../validators/roles.validator';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener lista de roles
 *     tags: [Roles]
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
 *         description: Lista de roles con paginación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, requirePermission('ROLES_READ'), rolesController.getAll);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
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
 *         description: Rol encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_READ
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, requirePermission('ROLES_READ'), rolesController.getById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear nuevo rol
 *     tags: [Roles]
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
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del rol (debe ser único)
 *               descripcion:
 *                 type: string
 *                 description: Descripción del rol
 *               estado:
 *                 type: boolean
 *                 default: true
 *           example:
 *             nombre: "ADMINISTRADOR"
 *             descripcion: "Rol con acceso completo al sistema"
 *             estado: true
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_CREATE
 *       409:
 *         description: Conflicto - Nombre de rol duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, requirePermission('ROLES_CREATE'), validate(CreateRolSchema), rolesController.create);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar rol
 *     tags: [Roles]
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
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_UPDATE
 *       404:
 *         description: Rol no encontrado
 *       409:
 *         description: Conflicto - Nombre de rol duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, requirePermission('ROLES_UPDATE'), validate(UpdateRolSchema), rolesController.update);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar rol (soft delete)
 *     tags: [Roles]
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
 *         description: Rol eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_DELETE
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, requirePermission('ROLES_DELETE'), rolesController.delete);

/**
 * @swagger
 * /api/roles/{id}/permisos:
 *   post:
 *     summary: Asignar permiso a rol
 *     tags: [Roles]
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
 *             required:
 *               - id_permiso
 *             properties:
 *               id_permiso:
 *                 type: integer
 *           example:
 *             id_permiso: 1
 *     responses:
 *       201:
 *         description: Permiso asignado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_ASSIGN_PERMISSION
 *       404:
 *         description: Rol o permiso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/permisos', authMiddleware, requirePermission('ROLES_ASSIGN_PERMISSION'), validate(AssignPermisoSchema), rolesController.assignPermission);

/**
 * @swagger
 * /api/roles/{id}/permisos/{permisoId}:
 *   delete:
 *     summary: Remover permiso de rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: permisoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso removido exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_REMOVE_PERMISSION
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/permisos/:permisoId', authMiddleware, requirePermission('ROLES_REMOVE_PERMISSION'), rolesController.removePermission);

/**
 * @swagger
 * /api/roles/{id}/permisos:
 *   get:
 *     summary: Obtener permisos de un rol
 *     tags: [Roles]
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
 *         description: Lista de permisos activos del rol
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso ROLES_READ
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/permisos', authMiddleware, requirePermission('ROLES_READ'), rolesController.getRolePermissions);

export default router;
