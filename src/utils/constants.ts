// Generos
export const GENEROS = {
  MASCULINO: 'M',
  FEMENINO: 'F',
} as const;

// Tipos de identificación
export const TIPOS_IDENTIFICACION = {
  CEDULA: 'CC',
  TARJETA_IDENTIDAD: 'TI',
  CEDULA_EXTRANJERIA: 'CE',
  PASAPORTE: 'PAS',
  REGISTRO_CIVIL: 'RC',
} as const;

// Estados civiles
export const ESTADOS_CIVILES = {
  SOLTERO: 'S',
  CASADO: 'C',
  VIUDO: 'V',
  DIVORCIADO: 'D',
  UNION_LIBRE: 'U',
} as const;

// Tipos de contacto
export const TIPOS_CONTACTO = {
  TELEFONO: 'TELEFONO',
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  OTRO: 'OTRO',
} as const;

// Parentescos
export const PARENTESCOS = {
  PADRE: 'PADRE',
  MADRE: 'MADRE',
  HIJO: 'HIJO',
  HIJA: 'HIJA',
  ESPOSO: 'ESPOSO',
  ESPOSA: 'ESPOSA',
  ABUELO: 'ABUELO',
  ABUELA: 'ABUELA',
  NIETO: 'NIETO',
  NIETA: 'NIETA',
  OTRO: 'OTRO',
} as const;

// Tipos de eventos
export const TIPOS_EVENTO = {
  CULTO: 'CULTO',
  REUNION: 'REUNION',
  CONFERENCIA: 'CONFERENCIA',
  RETIRO: 'RETIRO',
  SERVICIO: 'SERVICIO',
  OTRO: 'OTRO',
} as const;

// Acciones de auditoría
export const ACCIONES_AUDITORIA = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

// Paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// JWT
export const JWT_CONFIG = {
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  REFRESH_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
} as const;

// Bcrypt
export const BCRYPT_ROUNDS = 10;
