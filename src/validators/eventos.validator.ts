import { z } from 'zod';

const TipoEventoEnum = z.enum(['CULTO', 'REUNION', 'CONFERENCIA', 'RETIRO', 'SERVICIO', 'OTRO']);

const BaseEventoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
  tipo_evento: TipoEventoEnum,
  fecha_inicio: z.string().datetime('La fecha de inicio debe ser una fecha válida'),
  fecha_fin: z.string().datetime('La fecha de fin debe ser una fecha válida').optional(),
  ubicacion: z.string().max(200, 'La ubicación no puede exceder 200 caracteres').optional(),
  id_ministerio: z.number().int().positive('El ID del ministerio debe ser un número positivo').optional(),
});

export const CreateEventoSchema = BaseEventoSchema.refine(
  (data) => {
    if (data.fecha_fin) {
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
    path: ['fecha_fin'],
  }
);

export const UpdateEventoSchema = BaseEventoSchema.partial().refine(
  (data) => {
    if (data.fecha_fin && data.fecha_inicio) {
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
    path: ['fecha_fin'],
  }
);

export const RegisterAttendanceSchema = z.object({
  asistencias: z.array(
    z.object({
      id_persona: z.number().int().positive('El ID de la persona debe ser un número positivo'),
      asistio: z.boolean(),
      observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
    })
  ).min(1, 'Debe proporcionar al menos una asistencia'),
});
