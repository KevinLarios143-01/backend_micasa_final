import { z } from 'zod';

export const CreateUsuarioSchema = z.object({
  id_persona: z.number().int().positive('ID de persona debe ser positivo'),
  usuario: z.string().min(4, 'Usuario debe tener mínimo 4 caracteres').max(50),
  clave: z.string().min(8, 'Contraseña debe tener mínimo 8 caracteres').max(100),
});

export const UpdateUsuarioSchema = z.object({
  usuario: z.string().min(4).max(50).optional(),
  estado: z.boolean().optional(),
});

export const AssignRoleSchema = z.object({
  id_rol: z.number().int().positive('ID de rol debe ser positivo'),
});

export type CreateUsuarioDTO = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioDTO = z.infer<typeof UpdateUsuarioSchema>;
export type AssignRoleDTO = z.infer<typeof AssignRoleSchema>;
