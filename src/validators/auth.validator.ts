import { z } from 'zod';

export const LoginSchema = z.object({
  usuario: z.string().min(1, 'Usuario es requerido'),
  clave: z.string().min(1, 'Contraseña es requerida'),
});

export const ChangePasswordSchema = z.object({
  claveActual: z.string().min(1, 'Contraseña actual es requerida'),
  claveNueva: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(100, 'La contraseña debe tener máximo 100 caracteres'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Token de refresco es requerido'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
