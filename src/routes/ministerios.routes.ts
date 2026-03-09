import { Router } from 'express';
import { MinisteriosController } from '../controllers/ministerios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  CreateMinisterioSchema,
  UpdateMinisterioSchema,
  AssignMemberSchema,
  UpdateMemberCargoSchema,
} from '../validators/ministerios.validator';

const router = Router();
const ministeriosController = new MinisteriosController();

/**
 * @swagger
 * /api/ministerios:
 *   get:
 *     summary: Obtener todos los ministerios
 *     tags: [Ministerios]
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
 *     responses:
 *       200:
 *         description: Lista de ministerios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('MINISTERIOS_READ'),
  ministeriosController.getAll.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}:
 *   get:
 *     summary: Obtener ministerio por ID
 *     tags: [Ministerios]
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
 *         description: Ministerio encontrado
 *       404:
 *         description: Ministerio no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('MINISTERIOS_READ'),
  ministeriosController.getById.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios:
 *   post:
 *     summary: Crear nuevo ministerio
 *     tags: [Ministerios]
 *     security:
 *       - bearerAuth: []
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
 *               lider_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ministerio creado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('MINISTERIOS_CREATE'),
  validate(CreateMinisterioSchema),
  ministeriosController.create.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}:
 *   put:
 *     summary: Actualizar ministerio
 *     tags: [Ministerios]
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
 *               lider_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ministerio actualizado
 *       404:
 *         description: Ministerio no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('MINISTERIOS_UPDATE'),
  validate(UpdateMinisterioSchema),
  ministeriosController.update.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}:
 *   delete:
 *     summary: Eliminar ministerio (soft delete)
 *     tags: [Ministerios]
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
 *         description: Ministerio eliminado
 *       404:
 *         description: Ministerio no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('MINISTERIOS_DELETE'),
  ministeriosController.delete.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}/miembros:
 *   post:
 *     summary: Asignar persona a ministerio
 *     tags: [Ministerios]
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
 *               id_persona:
 *                 type: integer
 *               cargo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Miembro asignado
 *       404:
 *         description: Ministerio o persona no encontrado
 */
router.post(
  '/:id/miembros',
  authMiddleware,
  requirePermission('MINISTERIOS_ASSIGN_MEMBER'),
  validate(AssignMemberSchema),
  ministeriosController.assignPerson.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}/miembros/{personaId}:
 *   delete:
 *     summary: Remover persona de ministerio
 *     tags: [Ministerios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Miembro removido
 *       404:
 *         description: Miembro no encontrado
 */
router.delete(
  '/:id/miembros/:personaId',
  authMiddleware,
  requirePermission('MINISTERIOS_REMOVE_MEMBER'),
  ministeriosController.removePerson.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}/miembros:
 *   get:
 *     summary: Obtener miembros de un ministerio
 *     tags: [Ministerios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Lista de miembros
 *       404:
 *         description: Ministerio no encontrado
 */
router.get(
  '/:id/miembros',
  authMiddleware,
  requirePermission('MINISTERIOS_READ'),
  ministeriosController.getMembers.bind(ministeriosController)
);

/**
 * @swagger
 * /api/ministerios/{id}/miembros/{personaId}:
 *   put:
 *     summary: Actualizar cargo de miembro
 *     tags: [Ministerios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: personaId
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
 *               cargo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cargo actualizado
 *       404:
 *         description: Miembro no encontrado
 */
router.put(
  '/:id/miembros/:personaId',
  authMiddleware,
  requirePermission('MINISTERIOS_UPDATE_MEMBER'),
  validate(UpdateMemberCargoSchema),
  ministeriosController.updateMemberCargo.bind(ministeriosController)
);

export default router;
