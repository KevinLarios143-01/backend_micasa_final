import { z } from 'zod';

export const CreatePermisoSchema = z.object({
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(50)
    .regex(/^[A-Z_]+$/, 'Nombre debe estar en mayúsculas y usar guiones bajos'),
  descripcion: z.string().optional(),
  modulo: z.string().min(1, 'Módulo es requerido').max(50),
});

export const UpdatePermisoSchema = CreatePermisoSchema.partial();

export type CreatePermisoDTO = z.infer<typeof CreatePermisoSchema>;
export type UpdatePermisoDTO = z.infer<typeof UpdatePermisoSchema>;
