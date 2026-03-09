import { Request, Response, NextFunction } from 'express';
import { MinisteriosService } from '../services/ministerios.service';

const ministeriosService = new MinisteriosService();

export class MinisteriosController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ministeriosService.getAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const ministerio = await ministeriosService.getById(id);
      res.json(ministerio);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const ministerio = await ministeriosService.create(req.body, userId);
      res.status(201).json(ministerio);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const ministerio = await ministeriosService.update(id, req.body, userId);
      res.json(ministerio);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const result = await ministeriosService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async assignPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const ministerioId = parseInt(req.params.id);
      const { id_persona, cargo } = req.body;
      const userId = req.user!.userId;
      const miembro = await ministeriosService.assignPerson(ministerioId, id_persona, cargo, userId);
      res.status(201).json(miembro);
    } catch (error) {
      next(error);
    }
  }

  async removePerson(req: Request, res: Response, next: NextFunction) {
    try {
      const ministerioId = parseInt(req.params.id);
      const personaId = parseInt(req.params.personaId);
      const userId = req.user!.userId;
      const result = await ministeriosService.removePerson(ministerioId, personaId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const ministerioId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await ministeriosService.getMembers(ministerioId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberCargo(req: Request, res: Response, next: NextFunction) {
    try {
      const ministerioId = parseInt(req.params.id);
      const personaId = parseInt(req.params.personaId);
      const { cargo } = req.body;
      const userId = req.user!.userId;
      const miembro = await ministeriosService.updateMemberCargo(ministerioId, personaId, cargo, userId);
      res.json(miembro);
    } catch (error) {
      next(error);
    }
  }
}
