import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/authorization.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  CreateEventoSchema,
  UpdateEventoSchema,
  RegisterAttendanceSchema,
} from '../validators/eventos.validator';

const router = Router();
const eventosController = new EventosController();

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags: [Eventos]
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
 *         description: Lista de eventos
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getAll.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/fecha:
 *   get:
 *     summary: Obtener eventos por rango de fechas
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
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
 *         description: Lista de eventos en el rango
 */
router.get(
  '/fecha',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getByDateRange.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/ministerio/{ministerioId}:
 *   get:
 *     summary: Obtener eventos por ministerio
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ministerioId
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
 *         description: Lista de eventos del ministerio
 */
router.get(
  '/ministerio/:ministerioId',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getByMinisterio.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [Eventos]
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
 *         description: Evento encontrado
 *       404:
 *         description: Evento no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getById.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Crear nuevo evento
 *     tags: [Eventos]
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
 *               tipo_evento:
 *                 type: string
 *                 enum: [CULTO, REUNION, CONFERENCIA, RETIRO, SERVICIO, OTRO]
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *               ubicacion:
 *                 type: string
 *               id_ministerio:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Evento creado
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('EVENTOS_CREATE'),
  validate(CreateEventoSchema),
  eventosController.create.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}:
 *   put:
 *     summary: Actualizar evento
 *     tags: [Eventos]
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
 *               tipo_evento:
 *                 type: string
 *                 enum: [CULTO, REUNION, CONFERENCIA, RETIRO, SERVICIO, OTRO]
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *               ubicacion:
 *                 type: string
 *               id_ministerio:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Evento actualizado
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('EVENTOS_UPDATE'),
  validate(UpdateEventoSchema),
  eventosController.update.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}:
 *   delete:
 *     summary: Eliminar evento (soft delete)
 *     tags: [Eventos]
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
 *         description: Evento eliminado
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('EVENTOS_DELETE'),
  eventosController.delete.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}/asistencia:
 *   post:
 *     summary: Registrar asistencias a un evento
 *     tags: [Eventos]
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
 *               asistencias:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_persona:
 *                       type: integer
 *                     asistio:
 *                       type: boolean
 *                     observaciones:
 *                       type: string
 *     responses:
 *       201:
 *         description: Asistencias registradas
 */
router.post(
  '/:id/asistencia',
  authMiddleware,
  requirePermission('EVENTOS_REGISTER_ATTENDANCE'),
  validate(RegisterAttendanceSchema),
  eventosController.registerAttendance.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}/asistencia:
 *   get:
 *     summary: Obtener asistencias de un evento
 *     tags: [Eventos]
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
 *         description: Lista de asistencias
 */
router.get(
  '/:id/asistencia',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getAttendance.bind(eventosController)
);

/**
 * @swagger
 * /api/eventos/{id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de asistencia
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: ministerioId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Estadísticas de asistencia
 */
router.get(
  '/:id/estadisticas',
  authMiddleware,
  requirePermission('EVENTOS_READ'),
  eventosController.getAttendanceStats.bind(eventosController)
);

export default router;
