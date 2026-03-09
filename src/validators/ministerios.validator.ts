import { z } from 'zod';

export const CreateMinisterioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
  lider_id: z.number().int().positive('El ID del líder debe ser un número positivo').optional(),
});

export const UpdateMinisterioSchema = CreateMinisterioSchema.partial();

export const AssignMemberSchema = z.object({
  id_persona: z.number().int().positive('El ID de la persona debe ser un número positivo'),
  cargo: z.string().max(50, 'El cargo no puede exceder 50 caracteres').optional(),
});

export const UpdateMemberCargoSchema = z.object({
  cargo: z.string().max(50, 'El cargo no puede exceder 50 caracteres').optional(),
});
