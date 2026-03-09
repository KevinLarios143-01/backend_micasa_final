import { z } from 'zod';

export const CreateRolSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(50),
  descripcion: z.string().optional(),
});

export const UpdateRolSchema = CreateRolSchema.partial();

export const AssignPermisoSchema = z.object({
  id_permiso: z.number().int().positive('ID de permiso debe ser positivo'),
});

export type CreateRolDTO = z.infer<typeof CreateRolSchema>;
export type UpdateRolDTO = z.infer<typeof UpdateRolSchema>;
export type AssignPermisoDTO = z.infer<typeof AssignPermisoSchema>;
