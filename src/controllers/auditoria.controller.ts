import { Request, Response, NextFunction } from 'express';
import { auditoriaService } from '../services/auditoria.service';

class AuditoriaController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await auditoriaService.getAll(page, limit);
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getByTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tabla = req.params.tabla;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await auditoriaService.getByTable(tabla, page, limit);
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await auditoriaService.getByUser(userId, page, limit);
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = new Date(req.query.start as string);
      const endDate = new Date(req.query.end as string);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await auditoriaService.getByDateRange(startDate, endDate, page, limit);
      res.status(200).json({ success: true, data: result.data, metadata: result.metadata });
    } catch (error) {
      next(error);
    }
  }

  async getByRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tabla = req.params.tabla;
      const id = parseInt(req.params.id);
      const result = await auditoriaService.getByRecord(tabla, id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const auditoriaController = new AuditoriaController();
