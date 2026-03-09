import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      // Check if user has the required permission
      if (!user.permissions.includes(permission)) {
        // Log access denied
        logger.warn('Acceso denegado por falta de permisos', {
          usuario: user.username,
          userId: user.userId,
          permisoRequerido: permission,
          permisosUsuario: user.permissions,
          path: req.path,
          method: req.method,
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          timestamp: new Date().toISOString(),
        });

        res.status(403).json({
          success: false,
          error: 'No tiene permisos para realizar esta acción',
          requiredPermission: permission,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      // Check if user has the required role
      if (!user.roles.includes(role)) {
        // Log access denied
        logger.warn('Acceso denegado por falta de rol', {
          usuario: user.username,
          userId: user.userId,
          rolRequerido: role,
          rolesUsuario: user.roles,
          path: req.path,
          method: req.method,
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          timestamp: new Date().toISOString(),
        });

        res.status(403).json({
          success: false,
          error: 'No tiene el rol requerido para realizar esta acción',
          requiredRole: role,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
