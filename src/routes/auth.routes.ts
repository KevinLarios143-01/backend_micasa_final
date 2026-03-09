import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { LoginSchema, ChangePasswordSchema, RefreshTokenSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     description: Autentica un usuario con sus credenciales y retorna un token JWT válido por 8 horas. El token incluye userId, personaId, username, roles y permisos. Actualiza el campo ultimo_acceso del usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - clave
 *             properties:
 *               usuario:
 *                 type: string
 *                 description: Nombre de usuario
 *                 example: "admin"
 *               clave:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso - Retorna token JWT y datos del usuario
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
 *                     token:
 *                       type: string
 *                       description: Token JWT válido por 8 horas
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         persona:
 *                           type: object
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Error de validación - Datos faltantes o inválidos
 *       401:
 *         description: Credenciales inválidas o usuario inactivo
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', validate(LoginSchema), authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     description: Invalida el token JWT actual del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
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
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: No autenticado - Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token JWT
 *     description: Genera un nuevo token JWT válido por 8 horas adicionales usando un refresh token válido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token válido
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
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
 *                     token:
 *                       type: string
 *                       description: Nuevo token JWT
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/refresh', validate(RefreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     description: Retorna los datos completos del usuario actualmente autenticado incluyendo persona, roles y permisos
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario actual
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
 *                     persona:
 *                       type: object
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                     permisos:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autenticado - Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Cambiar contraseña del usuario
 *     description: Permite al usuario autenticado cambiar su contraseña. Requiere la contraseña actual para validación. La nueva contraseña debe tener mínimo 8 caracteres y será hasheada con bcrypt.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - claveActual
 *               - claveNueva
 *             properties:
 *               claveActual:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual del usuario
 *               claveNueva:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *           example:
 *             claveActual: "oldpassword123"
 *             claveNueva: "newpassword456"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
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
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Error de validación - Contraseña actual incorrecta o nueva contraseña inválida
 *       401:
 *         description: No autenticado - Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.put('/change-password', authMiddleware, validate(ChangePasswordSchema), authController.changePassword);

export default router;
