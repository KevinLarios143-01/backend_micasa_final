import { Request, Response, NextFunction } from 'express';
import { EventosService } from '../services/eventos.service';
import { AsistenciasService } from '../services/asistencias.service';

const eventosService = new EventosService();
const asistenciasService = new AsistenciasService();

export class EventosController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await eventosService.getAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const evento = await eventosService.getById(id);
      res.json(evento);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const evento = await eventosService.create(req.body, userId);
      res.status(201).json(evento);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const evento = await eventosService.update(id, req.body, userId);
      res.json(evento);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const result = await eventosService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!start || !end) {
        return res.status(400).json({ error: 'Se requieren los parámetros start y end' });
      }

      const result = await eventosService.getByDateRange(start as string, end as string, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByMinisterio(req: Request, res: Response, next: NextFunction) {
    try {
      const ministerioId = parseInt(req.params.ministerioId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await eventosService.getByMinisterio(ministerioId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async registerAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const eventoId = parseInt(req.params.id);
      const { asistencias } = req.body;
      const userId = req.user!.userId;

      const result = await asistenciasService.registerAttendance(eventoId, asistencias, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const eventoId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await asistenciasService.getAttendance(eventoId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const eventoId = req.params.id ? parseInt(req.params.id) : undefined;
      const ministerioId = req.query.ministerioId ? parseInt(req.query.ministerioId as string) : undefined;
      const startDate = req.query.start as string | undefined;
      const endDate = req.query.end as string | undefined;

      const result = await asistenciasService.getAttendanceStats(eventoId, ministerioId, startDate, endDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
