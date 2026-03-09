/**
 * Utilidades para respuestas estandarizadas de la API
 * Formato estándar: {success, data?, error?, metadata?}
 */

/**
 * Metadata de paginación
 */
export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Respuesta exitosa estándar
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Respuesta de error estándar
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  field?: string | string[];
}

/**
 * Respuesta paginada estándar
 */
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  metadata: PaginationMetadata;
}

/**
 * Genera una respuesta exitosa estandarizada
 * 
 * @param data - Datos a retornar
 * @param message - Mensaje opcional
 * @returns Objeto de respuesta exitosa
 * 
 * @example
 * ```typescript
 * res.status(200).json(successResponse(persona));
 * res.status(201).json(successResponse(usuario, 'Usuario creado exitosamente'));
 * ```
 */
export function successResponse<T = any>(
  data: T,
  message?: string
): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Genera una respuesta de error estandarizada
 * 
 * @param error - Mensaje de error
 * @param details - Detalles adicionales del error (opcional)
 * @param field - Campo(s) que causaron el error (opcional)
 * @returns Objeto de respuesta de error
 * 
 * @example
 * ```typescript
 * res.status(400).json(errorResponse('Error de validación', validationErrors));
 * res.status(404).json(errorResponse('Persona no encontrada'));
 * res.status(409).json(errorResponse('Ya existe un registro', null, 'identificacion'));
 * ```
 */
export function errorResponse(
  error: string,
  details?: any,
  field?: string | string[]
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (details !== undefined && details !== null) {
    response.details = details;
  }

  if (field) {
    response.field = field;
  }

  return response;
}

/**
 * Genera una respuesta paginada estandarizada
 * 
 * @param data - Array de datos a retornar
 * @param total - Total de registros en la base de datos
 * @param page - Página actual
 * @param limit - Límite de registros por página
 * @returns Objeto de respuesta paginada con metadata
 * 
 * @example
 * ```typescript
 * const personas = await prisma.personas.findMany({ skip, take: limit });
 * const total = await prisma.personas.count();
 * res.status(200).json(paginatedResponse(personas, total, page, limit));
 * ```
 */
export function paginatedResponse<T = any>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    data,
    metadata: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}
