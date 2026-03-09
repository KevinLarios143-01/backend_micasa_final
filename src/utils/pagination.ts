import { PAGINATION } from './constants';
import { PaginationMetadata } from './response';

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Resultado de paginación
 */
export interface PaginatedResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}

/**
 * Parámetros validados de paginación
 */
export interface ValidatedPaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Valida y normaliza los parámetros de paginación
 * 
 * Validaciones:
 * - page debe ser >= 1 (si es menor, se ajusta a 1)
 * - limit debe estar entre 1 y 100 (se ajusta al rango válido)
 * - Calcula skip para la consulta de base de datos
 * 
 * @param page - Número de página solicitado (por defecto 1)
 * @param limit - Límite de registros por página (por defecto 10)
 * @returns Parámetros validados y normalizados
 * 
 * @example
 * ```typescript
 * const params = validatePaginationParams(2, 50);
 * // { page: 2, limit: 50, skip: 50 }
 * 
 * const params = validatePaginationParams(-1, 200);
 * // { page: 1, limit: 100, skip: 0 }
 * ```
 */
export function validatePaginationParams(
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT
): ValidatedPaginationParams {
  // Validar que page >= 1
  const validPage = Math.max(1, page);
  
  // Validar que limit esté entre 1 y 100
  const validLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, limit)
  );
  
  // Calcular skip para la consulta
  const skip = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
}

/**
 * Calcula la metadata de paginación
 * 
 * @param total - Total de registros en la base de datos
 * @param page - Página actual
 * @param limit - Límite de registros por página
 * @returns Metadata de paginación con totalPages, hasNextPage, hasPrevPage
 * 
 * @example
 * ```typescript
 * const metadata = calculatePaginationMetadata(150, 2, 10);
 * // {
 * //   total: 150,
 * //   page: 2,
 * //   limit: 10,
 * //   totalPages: 15,
 * //   hasNextPage: true,
 * //   hasPrevPage: true
 * // }
 * ```
 */
export function calculatePaginationMetadata(
  total: number,
  page: number,
  limit: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

/**
 * Función principal de paginación reutilizable
 * 
 * Esta función encapsula toda la lógica de paginación:
 * 1. Valida y normaliza los parámetros (page >= 1, limit entre 1 y 100)
 * 2. Ejecuta la consulta de datos con skip y take
 * 3. Ejecuta la consulta de conteo total
 * 4. Calcula la metadata de paginación (totalPages, hasNextPage, hasPrevPage)
 * 5. Retorna datos y metadata en formato consistente
 * 
 * @param queryFn - Función que ejecuta la consulta de datos (recibe skip y limit)
 * @param countFn - Función que ejecuta el conteo total de registros
 * @param options - Opciones de paginación (page y limit)
 * @returns Resultado paginado con data y metadata
 * 
 * @example
 * ```typescript
 * // Uso básico con Prisma
 * const result = await paginateResults(
 *   (skip, limit) => prisma.personas.findMany({
 *     where: { estado: true },
 *     skip,
 *     take: limit,
 *     orderBy: { fecha_creacion: 'desc' }
 *   }),
 *   () => prisma.personas.count({ where: { estado: true } }),
 *   { page: 2, limit: 20 }
 * );
 * 
 * // Uso con filtros complejos
 * const filters = { estado: true, genero: 'M' };
 * const result = await paginateResults(
 *   (skip, limit) => prisma.personas.findMany({
 *     where: filters,
 *     skip,
 *     take: limit
 *   }),
 *   () => prisma.personas.count({ where: filters }),
 *   { page: 1, limit: 50 }
 * );
 * ```
 */
export async function paginateResults<T>(
  queryFn: (skip: number, limit: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  // Validar y normalizar parámetros
  const { page, limit, skip } = validatePaginationParams(
    options.page,
    options.limit
  );
  
  // Ejecutar consultas en paralelo
  const [data, total] = await Promise.all([
    queryFn(skip, limit),
    countFn(),
  ]);
  
  // Calcular metadata
  const metadata = calculatePaginationMetadata(total, page, limit);
  
  return {
    data,
    metadata,
  };
}
