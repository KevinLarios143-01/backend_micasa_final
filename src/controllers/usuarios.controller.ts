import { Request, Response, NextFunction } from 'express';
import { usuariosService } from '../services/usuarios.service';

class UsuariosController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado === 'false' ? false : true;

      const result = await usuariosService.getAll(page, limit, { estado });

      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const usuario = await usuariosService.getById(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const usuario = await usuariosService.create(req.body, userId);

      res.status(201).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const usuario = await usuariosService.update(id, req.body, userId);

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      await usuariosService.delete(id, userId);

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { id_rol } = req.body;
      const assignedBy = req.user?.userId;

      const result = await usuariosService.assignRole(userId, id_rol, assignedBy);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);
      const removedBy = req.user?.userId;

      await usuariosService.removeRole(userId, roleId, removedBy);

      res.status(200).json({
        success: true,
        message: 'Rol removido exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const roles = await usuariosService.getUserRoles(userId);

      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const permissions = await usuariosService.getUserPermissions(userId);

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usuariosController = new UsuariosController();
