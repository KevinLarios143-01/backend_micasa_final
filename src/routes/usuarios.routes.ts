import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreateUsuarioSchema, UpdateUsuarioSchema, AssignRoleSchema } from '../validators/usuarios.validator';

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Registros por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de usuarios con paginación
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
 *         description: Sin permisos - Requiere permiso USUARIOS_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, requirePermission('USUARIOS_READ'), usuariosController.getAll);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *                     id_usuario:
 *                       type: integer
 *                     usuario:
 *                       type: string
 *                     id_persona:
 *                       type: integer
 *                     estado:
 *                       type: boolean
 *                     ultimo_acceso:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_READ
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, requirePermission('USUARIOS_READ'), usuariosController.getById);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_persona
 *               - usuario
 *               - clave
 *             properties:
 *               id_persona:
 *                 type: integer
 *                 description: ID de la persona asociada (debe ser único)
 *               usuario:
 *                 type: string
 *                 minLength: 4
 *                 description: Nombre de usuario (mínimo 4 caracteres, debe ser único)
 *               clave:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña (mínimo 8 caracteres, se hasheará con bcrypt)
 *               estado:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo/inactivo del usuario
 *           example:
 *             id_persona: 1
 *             usuario: "jdoe"
 *             clave: "password123"
 *             estado: true
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación - Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_CREATE
 *       409:
 *         description: Conflicto - Usuario o id_persona duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, requirePermission('USUARIOS_CREATE'), validate(CreateUsuarioSchema), usuariosController.create);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 minLength: 4
 *               estado:
 *                 type: boolean
 *           example:
 *             usuario: "jdoe_updated"
 *             estado: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_UPDATE
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Conflicto - Nombre de usuario duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, requirePermission('USUARIOS_UPDATE'), validate(UpdateUsuarioSchema), usuariosController.update);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente (soft delete)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_DELETE
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, requirePermission('USUARIOS_DELETE'), usuariosController.delete);

/**
 * @swagger
 * /api/usuarios/{id}/roles:
 *   post:
 *     summary: Asignar rol a usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_rol
 *             properties:
 *               id_rol:
 *                 type: integer
 *                 description: ID del rol a asignar
 *           example:
 *             id_rol: 1
 *     responses:
 *       201:
 *         description: Rol asignado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_ASSIGN_ROLE
 *       404:
 *         description: Usuario o rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/roles', authMiddleware, requirePermission('USUARIOS_ASSIGN_ROLE'), validate(AssignRoleSchema), usuariosController.assignRole);

/**
 * @swagger
 * /api/usuarios/{id}/roles/{roleId}:
 *   delete:
 *     summary: Remover rol de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a remover
 *     responses:
 *       200:
 *         description: Rol removido exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_REMOVE_ROLE
 *       404:
 *         description: Asignación de rol no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/roles/:roleId', authMiddleware, requirePermission('USUARIOS_REMOVE_ROLE'), usuariosController.removeRole);

/**
 * @swagger
 * /api/usuarios/{id}/roles:
 *   get:
 *     summary: Obtener roles de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de roles activos del usuario
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_READ
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/roles', authMiddleware, requirePermission('USUARIOS_READ'), usuariosController.getUserRoles);

/**
 * @swagger
 * /api/usuarios/{id}/permisos:
 *   get:
 *     summary: Obtener permisos de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de permisos únicos del usuario (unión de todos sus roles activos)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso USUARIOS_READ
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/permisos', authMiddleware, requirePermission('USUARIOS_READ'), usuariosController.getUserPermissions);

export default router;
