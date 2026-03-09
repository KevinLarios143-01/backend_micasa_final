import { z } from 'zod';

const TipoContactoEnum = z.enum(['TELEFONO', 'EMAIL', 'WHATSAPP', 'OTRO']);

export const CreateContactoSchema = z.object({
  id_persona: z.number().int().positive('El ID de la persona debe ser un número positivo'),
  tipo_contacto: TipoContactoEnum,
  valor: z.string().min(1, 'El valor es obligatorio').max(100, 'El valor no puede exceder 100 caracteres'),
  es_principal: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.tipo_contacto === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data.valor);
    }
    return true;
  },
  {
    message: 'El formato del email no es válido',
    path: ['valor'],
  }
);

export const UpdateContactoSchema = z.object({
  tipo_contacto: TipoContactoEnum.optional(),
  valor: z.string().min(1, 'El valor es obligatorio').max(100, 'El valor no puede exceder 100 caracteres').optional(),
  es_principal: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.tipo_contacto === 'EMAIL' && data.valor) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data.valor);
    }
    return true;
  },
  {
    message: 'El formato del email no es válido',
    path: ['valor'],
  }
);
