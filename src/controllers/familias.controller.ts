import { Request, Response, NextFunction } from 'express';
import { FamiliasService } from '../services/familias.service';

const familiasService = new FamiliasService();

export class FamiliasController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await familiasService.getAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const familia = await familiasService.getById(id);
      res.json(familia);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const familia = await familiasService.create(req.body, userId);
      res.status(201).json(familia);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const familia = await familiasService.update(id, req.body, userId);
      res.json(familia);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const result = await familiasService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const familiaId = parseInt(req.params.id);
      const { id_persona, parentesco, es_cabeza_familia } = req.body;
      const userId = req.user!.userId;
      const miembro = await familiasService.addMember(familiaId, id_persona, parentesco, es_cabeza_familia, userId);
      res.status(201).json(miembro);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const familiaId = parseInt(req.params.id);
      const personaId = parseInt(req.params.personaId);
      const userId = req.user!.userId;
      const result = await familiasService.removeMember(familiaId, personaId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const familiaId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await familiasService.getMembers(familiaId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberParentesco(req: Request, res: Response, next: NextFunction) {
    try {
      const familiaId = parseInt(req.params.id);
      const personaId = parseInt(req.params.personaId);
      const { parentesco, es_cabeza_familia } = req.body;
      const userId = req.user!.userId;
      const miembro = await familiasService.updateMemberParentesco(
        familiaId,
        personaId,
        parentesco,
        es_cabeza_familia,
        userId
      );
      res.json(miembro);
    } catch (error) {
      next(error);
    }
  }
}
