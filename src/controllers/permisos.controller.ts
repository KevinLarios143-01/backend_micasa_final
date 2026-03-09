import { Request, Response, NextFunction } from 'express';
import { permisosService } from '../services/permisos.service';

class PermisosController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado === 'false' ? false : true;
      const result = await permisosService.getAll(page, limit, { estado });
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const permiso = await permisosService.getById(id);
      if (!permiso) {
        res.status(404).json({ success: false, error: 'Permiso no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data: permiso });
    } catch (error) {
      next(error);
    }
  }

  async getByModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modulo = req.params.modulo;
      const permisos = await permisosService.getByModule(modulo);
      res.status(200).json({ success: true, data: permisos });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const permiso = await permisosService.create(req.body, userId);
      res.status(201).json({ success: true, data: permiso });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const permiso = await permisosService.update(id, req.body, userId);
      res.status(200).json({ success: true, data: permiso });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      await permisosService.delete(id, userId);
      res.status(200).json({ success: true, message: 'Permiso eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const permisosController = new PermisosController();
