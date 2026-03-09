import { Router } from 'express';
import { ContactosController } from '../controllers/contactos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import { CreateContactoSchema, UpdateContactoSchema } from '../validators/contactos.validator';

const router = Router();
const contactosController = new ContactosController();

/**
 * @swagger
 * /api/contactos/persona/{personaId}:
 *   get:
 *     summary: Obtener contactos de una persona
 *     tags: [Contactos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personaId
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
 *         description: Lista de contactos
 *       404:
 *         description: Persona no encontrada
 */
router.get(
  '/persona/:personaId',
  authMiddleware,
  requirePermission('CONTACTOS_READ'),
  contactosController.getByPersona.bind(contactosController)
);

/**
 * @swagger
 * /api/contactos/{id}:
 *   get:
 *     summary: Obtener contacto por ID
 *     tags: [Contactos]
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
 *         description: Contacto encontrado
 *       404:
 *         description: Contacto no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('CONTACTOS_READ'),
  contactosController.getById.bind(contactosController)
);

/**
 * @swagger
 * /api/contactos:
 *   post:
 *     summary: Crear nuevo contacto
 *     tags: [Contactos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_persona:
 *                 type: integer
 *               tipo_contacto:
 *                 type: string
 *                 enum: [TELEFONO, EMAIL, WHATSAPP, OTRO]
 *               valor:
 *                 type: string
 *               es_principal:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Contacto creado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('CONTACTOS_CREATE'),
  validate(CreateContactoSchema),
  contactosController.create.bind(contactosController)
);

/**
 * @swagger
 * /api/contactos/{id}:
 *   put:
 *     summary: Actualizar contacto
 *     tags: [Contactos]
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
 *               tipo_contacto:
 *                 type: string
 *                 enum: [TELEFONO, EMAIL, WHATSAPP, OTRO]
 *               valor:
 *                 type: string
 *               es_principal:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contacto actualizado
 *       404:
 *         description: Contacto no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('CONTACTOS_UPDATE'),
  validate(UpdateContactoSchema),
  contactosController.update.bind(contactosController)
);

/**
 * @swagger
 * /api/contactos/{id}:
 *   delete:
 *     summary: Eliminar contacto (soft delete)
 *     tags: [Contactos]
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
 *         description: Contacto eliminado
 *       404:
 *         description: Contacto no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('CONTACTOS_DELETE'),
  contactosController.delete.bind(contactosController)
);

/**
 * @swagger
 * /api/contactos/{id}/principal:
 *   put:
 *     summary: Marcar contacto como principal
 *     tags: [Contactos]
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
 *         description: Contacto marcado como principal
 *       404:
 *         description: Contacto no encontrado
 */
router.put(
  '/:id/principal',
  authMiddleware,
  requirePermission('CONTACTOS_UPDATE'),
  contactosController.setPrincipal.bind(contactosController)
);

export default router;
