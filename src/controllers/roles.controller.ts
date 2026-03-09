import { Request, Response, NextFunction } from 'express';
import { rolesService } from '../services/roles.service';

class RolesController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado === 'false' ? false : true;
      const result = await rolesService.getAll(page, limit, { estado });
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const rol = await rolesService.getById(id);
      if (!rol) {
        res.status(404).json({ success: false, error: 'Rol no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data: rol });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const rol = await rolesService.create(req.body, userId);
      res.status(201).json({ success: true, data: rol });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const rol = await rolesService.update(id, req.body, userId);
      res.status(200).json({ success: true, data: rol });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      await rolesService.delete(id, userId);
      res.status(200).json({ success: true, message: 'Rol eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async assignPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rolId = parseInt(req.params.id);
      const { id_permiso } = req.body;
      const userId = req.user?.userId;
      const result = await rolesService.assignPermission(rolId, id_permiso, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async removePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rolId = parseInt(req.params.id);
      const permisoId = parseInt(req.params.permisoId);
      const userId = req.user?.userId;
      await rolesService.removePermission(rolId, permisoId, userId);
      res.status(200).json({ success: true, message: 'Permiso removido exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rolId = parseInt(req.params.id);
      const permissions = await rolesService.getRolePermissions(rolId);
      res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      next(error);
    }
  }
}

export const rolesController = new RolesController();
