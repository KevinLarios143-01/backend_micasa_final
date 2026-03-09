import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    user: req.user?.userId,
  });

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Ya existe un registro con ese valor',
        field: error.meta?.target,
      });
      return;
    }

    // Record not found
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Registro no encontrado',
      });
      return;
    }

    // Foreign key constraint violation (invalid reference on create)
    if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        error: 'Referencia inválida',
      });
      return;
    }

    // Foreign key constraint violation (cannot delete referenced record)
    if (error.code === 'P2014') {
      res.status(409).json({
        success: false,
        error: 'No se puede eliminar el registro porque está siendo referenciado por otros registros',
      });
      return;
    }

    // Record to delete does not exist
    if (error.code === 'P2018') {
      res.status(404).json({
        success: false,
        error: 'Registro no encontrado',
      });
      return;
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Authorization errors
  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Forbidden errors
  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
};
