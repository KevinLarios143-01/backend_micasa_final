import { Router } from 'express';
import { auditoriaController } from '../controllers/auditoria.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';

const router = Router();

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     summary: Obtener todos los registros de auditoría
 *     tags: [Auditoría]
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
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_auditoria:
 *                         type: integer
 *                       tabla:
 *                         type: string
 *                       id_registro:
 *                         type: integer
 *                       accion:
 *                         type: string
 *                         enum: [INSERT, UPDATE, DELETE]
 *                       datos_anteriores:
 *                         type: object
 *                       datos_nuevos:
 *                         type: object
 *                       id_usuario:
 *                         type: integer
 *                       fecha_accion:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso AUDITORIA_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, requirePermission('AUDITORIA_READ'), auditoriaController.getAll);

/**
 * @swagger
 * /api/auditoria/tabla/{tabla}:
 *   get:
 *     summary: Obtener registros de auditoría por tabla
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tabla
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la tabla (ej. personas, usuarios, roles)
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
 *         description: Registros de auditoría de la tabla especificada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso AUDITORIA_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tabla/:tabla', authMiddleware, requirePermission('AUDITORIA_READ'), auditoriaController.getByTable);

/**
 * @swagger
 * /api/auditoria/usuario/{userId}:
 *   get:
 *     summary: Obtener registros de auditoría por usuario
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *         description: Registros de auditoría del usuario especificado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso AUDITORIA_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuario/:userId', authMiddleware, requirePermission('AUDITORIA_READ'), auditoriaController.getByUser);

/**
 * @swagger
 * /api/auditoria/fecha:
 *   get:
 *     summary: Obtener registros de auditoría por rango de fechas
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ISO 8601)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ISO 8601)
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
 *         description: Registros de auditoría en el rango de fechas especificado
 *       400:
 *         description: Error de validación - Fechas inválidas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso AUDITORIA_READ
 *       500:
 *         description: Error interno del servidor
 */
router.get('/fecha', authMiddleware, requirePermission('AUDITORIA_READ'), auditoriaController.getByDateRange);

/**
 * @swagger
 * /api/auditoria/registro/{tabla}/{id}:
 *   get:
 *     summary: Obtener historial completo de un registro específico
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tabla
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la tabla
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
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
 *         description: Historial completo de cambios del registro ordenado cronológicamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos - Requiere permiso AUDITORIA_READ
 *       404:
 *         description: No se encontraron registros de auditoría
 *       500:
 *         description: Error interno del servidor
 */
router.get('/registro/:tabla/:id', authMiddleware, requirePermission('AUDITORIA_READ'), auditoriaController.getByRecord);

export default router;
