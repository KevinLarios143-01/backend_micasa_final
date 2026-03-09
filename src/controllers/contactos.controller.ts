import { Request, Response, NextFunction } from 'express';
import { ContactosService } from '../services/contactos.service';

const contactosService = new ContactosService();

export class ContactosController {
  async getByPersona(req: Request, res: Response, next: NextFunction) {
    try {
      const personaId = parseInt(req.params.personaId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await contactosService.getByPersona(personaId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const contacto = await contactosService.getById(id);
      res.json(contacto);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const contacto = await contactosService.create(req.body, userId);
      res.status(201).json(contacto);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const contacto = await contactosService.update(id, req.body, userId);
      res.json(contacto);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const result = await contactosService.delete(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async setPrincipal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;
      const contacto = await contactosService.setPrincipal(id, userId);
      res.json(contacto);
    } catch (error) {
      next(error);
    }
  }
}
