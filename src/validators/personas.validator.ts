import { z } from 'zod';

// Create base schema without refinement for partial updates
const BasePersonaSchema = z.object({
  primer_nombre: z.string().min(1, 'Primer nombre es requerido').max(50),
  segundo_nombre: z.string().max(50).optional(),
  tercer_nombre: z.string().max(50).optional(),
  primer_apellido: z.string().min(1, 'Primer apellido es requerido').max(50),
  segundo_apellido: z.string().max(50).optional(),
  fecha_nacimiento: z.string().or(z.date()),
  genero: z.enum(['M', 'F'], { errorMap: () => ({ message: 'Género debe ser M o F' }) }),
  bautizado: z.boolean().default(false),
  fecha_bautizo: z.string().or(z.date()).optional(),
  identificacion: z.string().min(1, 'Identificación es requerida').max(20),
  tipo_identificacion: z.enum(['CC', 'TI', 'CE', 'PAS', 'RC'], {
    errorMap: () => ({ message: 'Tipo de identificación inválido' }),
  }),
  estado_civil: z.enum(['S', 'C', 'V', 'D', 'U'], {
    errorMap: () => ({ message: 'Estado civil inválido' }),
  }),
  celular: z.string().max(20).optional(),
  email: z.string().email('Email inválido').max(100).optional(),
  direccion: z.string().optional(),
});

export const CreatePersonaSchema = BasePersonaSchema.refine(
  (data) => {
    if (data.bautizado && data.fecha_bautizo) {
      const fechaNac = new Date(data.fecha_nacimiento);
      const fechaBau = new Date(data.fecha_bautizo);
      return fechaBau >= fechaNac;
    }
    return true;
  },
  {
    message: 'Fecha de bautizo debe ser posterior a fecha de nacimiento',
    path: ['fecha_bautizo'],
  }
);

export const UpdatePersonaSchema = BasePersonaSchema.partial().refine(
  (data) => {
    if (data.bautizado && data.fecha_bautizo && data.fecha_nacimiento) {
      const fechaNac = new Date(data.fecha_nacimiento);
      const fechaBau = new Date(data.fecha_bautizo);
      return fechaBau >= fechaNac;
    }
    return true;
  },
  {
    message: 'Fecha de bautizo debe ser posterior a fecha de nacimiento',
    path: ['fecha_bautizo'],
  }
);

export type CreatePersonaDTO = z.infer<typeof CreatePersonaSchema>;
export type UpdatePersonaDTO = z.infer<typeof UpdatePersonaSchema>;
