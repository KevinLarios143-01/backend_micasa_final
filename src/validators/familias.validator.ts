import { z } from 'zod';

const ParentescoEnum = z.enum([
  'PADRE',
  'MADRE',
  'HIJO',
  'HIJA',
  'ESPOSO',
  'ESPOSA',
  'ABUELO',
  'ABUELA',
  'NIETO',
  'NIETA',
  'OTRO',
]);

export const CreateFamiliaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
});

export const UpdateFamiliaSchema = CreateFamiliaSchema.partial();

export const AddMemberSchema = z.object({
  id_persona: z.number().int().positive('El ID de la persona debe ser un número positivo'),
  parentesco: ParentescoEnum,
  es_cabeza_familia: z.boolean().default(false),
});

export const UpdateMemberParentescoSchema = z.object({
  parentesco: ParentescoEnum,
  es_cabeza_familia: z.boolean().optional(),
});
