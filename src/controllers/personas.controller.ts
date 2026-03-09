import { Request, Response, NextFunction } from 'express';
import { personasService } from '../services/personas.service';

class PersonasController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado === 'false' ? false : true;

      const result = await personasService.getAll(page, limit, { estado });

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
      const persona = await personasService.getById(id);

      if (!persona) {
        res.status(404).json({
          success: false,
          error: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: persona,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByIdentificacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identificacion = req.params.identificacion;
      const persona = await personasService.getByIdentificacion(identificacion);

      if (!persona) {
        res.status(404).json({
          success: false,
          error: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: persona,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          error: 'Parámetro de búsqueda requerido',
        });
        return;
      }

      const result = await personasService.search(searchTerm, page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const persona = await personasService.create(req.body, userId);

      res.status(201).json({
        success: true,
        data: persona,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const persona = await personasService.update(id, req.body, userId);

      res.status(200).json({
        success: true,
        data: persona,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      await personasService.delete(id, userId);

      res.status(200).json({
        success: true,
        message: 'Persona eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const personasController = new PersonasController();
