import { Router } from 'express';
import { FamiliasController } from '../controllers/familias.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  CreateFamiliaSchema,
  UpdateFamiliaSchema,
  AddMemberSchema,
  UpdateMemberParentescoSchema,
} from '../validators/familias.validator';

const router = Router();
const familiasController = new FamiliasController();

/**
 * @swagger
 * /api/familias:
 *   get:
 *     summary: Obtener todas las familias
 *     tags: [Familias]
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
 *         description: Lista de familias
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('FAMILIAS_READ'),
  familiasController.getAll.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}:
 *   get:
 *     summary: Obtener familia por ID
 *     tags: [Familias]
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
 *         description: Familia encontrada
 *       404:
 *         description: Familia no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('FAMILIAS_READ'),
  familiasController.getById.bind(familiasController)
);

/**
 * @swagger
 * /api/familias:
 *   post:
 *     summary: Crear nueva familia
 *     tags: [Familias]
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
 *     responses:
 *       201:
 *         description: Familia creada
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('FAMILIAS_CREATE'),
  validate(CreateFamiliaSchema),
  familiasController.create.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}:
 *   put:
 *     summary: Actualizar familia
 *     tags: [Familias]
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
 *     responses:
 *       200:
 *         description: Familia actualizada
 *       404:
 *         description: Familia no encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('FAMILIAS_UPDATE'),
  validate(UpdateFamiliaSchema),
  familiasController.update.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}:
 *   delete:
 *     summary: Eliminar familia (soft delete)
 *     tags: [Familias]
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
 *         description: Familia eliminada
 *       404:
 *         description: Familia no encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('FAMILIAS_DELETE'),
  familiasController.delete.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}/miembros:
 *   post:
 *     summary: Agregar miembro a familia
 *     tags: [Familias]
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
 *               parentesco:
 *                 type: string
 *                 enum: [PADRE, MADRE, HIJO, HIJA, ESPOSO, ESPOSA, ABUELO, ABUELA, NIETO, NIETA, OTRO]
 *               es_cabeza_familia:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Miembro agregado
 *       404:
 *         description: Familia o persona no encontrada
 */
router.post(
  '/:id/miembros',
  authMiddleware,
  requirePermission('FAMILIAS_ADD_MEMBER'),
  validate(AddMemberSchema),
  familiasController.addMember.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}/miembros/{personaId}:
 *   delete:
 *     summary: Remover miembro de familia
 *     tags: [Familias]
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
  requirePermission('FAMILIAS_REMOVE_MEMBER'),
  familiasController.removeMember.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}/miembros:
 *   get:
 *     summary: Obtener miembros de una familia
 *     tags: [Familias]
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
 *         description: Familia no encontrada
 */
router.get(
  '/:id/miembros',
  authMiddleware,
  requirePermission('FAMILIAS_READ'),
  familiasController.getMembers.bind(familiasController)
);

/**
 * @swagger
 * /api/familias/{id}/miembros/{personaId}:
 *   put:
 *     summary: Actualizar parentesco de miembro
 *     tags: [Familias]
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
 *               parentesco:
 *                 type: string
 *                 enum: [PADRE, MADRE, HIJO, HIJA, ESPOSO, ESPOSA, ABUELO, ABUELA, NIETO, NIETA, OTRO]
 *               es_cabeza_familia:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Parentesco actualizado
 *       404:
 *         description: Miembro no encontrado
 */
router.put(
  '/:id/miembros/:personaId',
  authMiddleware,
  requirePermission('FAMILIAS_UPDATE_MEMBER'),
  validate(UpdateMemberParentescoSchema),
  familiasController.updateMemberParentesco.bind(familiasController)
);

export default router;
