/**
 * Ejemplos de uso de las utilidades de respuesta
 * Este archivo muestra cómo usar las funciones de respuesta estandarizadas
 */

import { Request, Response } from 'express';
import { successResponse, errorResponse, paginatedResponse } from './response';

// Ejemplo 1: Respuesta exitosa simple
export function exampleSuccessResponse(req: Request, res: Response) {
  const persona = {
    id_persona: 1,
    primer_nombre: 'Juan',
    primer_apellido: 'Pérez',
    identificacion: '1234567890',
  };

  res.status(200).json(successResponse(persona));
  // Resultado:
  // {
  //   "success": true,
  //   "data": {
  //     "id_persona": 1,
  //     "primer_nombre": "Juan",
  //     "primer_apellido": "Pérez",
  //     "identificacion": "1234567890"
  //   }
  // }
}

// Ejemplo 2: Respuesta exitosa con mensaje
export function exampleSuccessWithMessage(req: Request, res: Response) {
  const usuario = {
    id_usuario: 1,
    usuario: 'admin',
    id_persona: 1,
  };

  res.status(201).json(successResponse(usuario, 'Usuario creado exitosamente'));
  // Resultado:
  // {
  //   "success": true,
  //   "data": {
  //     "id_usuario": 1,
  //     "usuario": "admin",
  //     "id_persona": 1
  //   },
  //   "message": "Usuario creado exitosamente"
  // }
}

// Ejemplo 3: Respuesta de error simple
export function exampleErrorResponse(req: Request, res: Response) {
  res.status(404).json(errorResponse('Persona no encontrada'));
  // Resultado:
  // {
  //   "success": false,
  //   "error": "Persona no encontrada"
  // }
}

// Ejemplo 4: Respuesta de error con detalles de validación
export function exampleValidationError(req: Request, res: Response) {
  const validationErrors = [
    { field: 'email', message: 'Formato de email inválido' },
    { field: 'fecha_nacimiento', message: 'Debe ser una fecha en el pasado' },
  ];

  res.status(400).json(errorResponse('Error de validación', validationErrors));
  // Resultado:
  // {
  //   "success": false,
  //   "error": "Error de validación",
  //   "details": [
  //     { "field": "email", "message": "Formato de email inválido" },
  //     { "field": "fecha_nacimiento", "message": "Debe ser una fecha en el pasado" }
  //   ]
  // }
}

// Ejemplo 5: Respuesta de error con campo específico
export function exampleUniqueConstraintError(req: Request, res: Response) {
  res.status(409).json(
    errorResponse('Ya existe un registro con ese valor', null, 'identificacion')
  );
  // Resultado:
  // {
  //   "success": false,
  //   "error": "Ya existe un registro con ese valor",
  //   "field": "identificacion"
  // }
}

// Ejemplo 6: Respuesta paginada
export function examplePaginatedResponse(req: Request, res: Response) {
  const personas = [
    { id_persona: 1, primer_nombre: 'Juan', primer_apellido: 'Pérez' },
    { id_persona: 2, primer_nombre: 'María', primer_apellido: 'García' },
    { id_persona: 3, primer_nombre: 'Pedro', primer_apellido: 'López' },
  ];

  const total = 25; // Total de registros en la base de datos
  const page = 1;
  const limit = 10;

  res.status(200).json(paginatedResponse(personas, total, page, limit));
  // Resultado:
  // {
  //   "success": true,
  //   "data": [
  //     { "id_persona": 1, "primer_nombre": "Juan", "primer_apellido": "Pérez" },
  //     { "id_persona": 2, "primer_nombre": "María", "primer_apellido": "García" },
  //     { "id_persona": 3, "primer_nombre": "Pedro", "primer_apellido": "López" }
  //   ],
  //   "metadata": {
  //     "total": 25,
  //     "page": 1,
  //     "limit": 10,
  //     "totalPages": 3,
  //     "hasNextPage": true,
  //     "hasPrevPage": false
  //   }
  // }
}

// Ejemplo 7: Uso en un controlador real
export async function exampleRealController(req: Request, res: Response) {
  try {
    // Simular obtención de datos paginados
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Simular consulta a base de datos
    const personas = [
      { id_persona: 1, primer_nombre: 'Juan', primer_apellido: 'Pérez' },
    ];
    const total = 1;

    // Retornar respuesta paginada
    res.status(200).json(paginatedResponse(personas, total, page, limit));
  } catch (error) {
    // Retornar respuesta de error
    res.status(500).json(errorResponse('Error interno del servidor'));
  }
}
