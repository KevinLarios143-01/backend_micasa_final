import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.routes';
import personasRoutes from './personas.routes';
import usuariosRoutes from './usuarios.routes';
import rolesRoutes from './roles.routes';
import permisosRoutes from './permisos.routes';
import ministeriosRoutes from './ministerios.routes';
import familiasRoutes from './familias.routes';
import contactosRoutes from './contactos.routes';
import eventosRoutes from './eventos.routes';
import auditoriaRoutes from './auditoria.routes';

const router = Router();

// Login rate limiting específico para rutas de autenticación
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'),
  message: 'Demasiados intentos de login desde esta IP',
  skipSuccessfulRequests: true,
});

// Montar rutas de autenticación con rate limiting específico
router.use('/auth', loginLimiter, authRoutes);

// Montar rutas de personas
router.use('/personas', personasRoutes);

// Montar rutas de usuarios
router.use('/usuarios', usuariosRoutes);

// Montar rutas de roles
router.use('/roles', rolesRoutes);

// Montar rutas de permisos
router.use('/permisos', permisosRoutes);

// Montar rutas de ministerios
router.use('/ministerios', ministeriosRoutes);

// Montar rutas de familias
router.use('/familias', familiasRoutes);

// Montar rutas de contactos
router.use('/contactos', contactosRoutes);

// Montar rutas de eventos
router.use('/eventos', eventosRoutes);

// Montar rutas de auditoría
router.use('/auditoria', auditoriaRoutes);

export default router;
