import { PrismaClient } from '@prisma/client';
import { auditoriaService } from './auditoria.service';

const prisma = new PrismaClient();

export class AsistenciasService {
  async registerAttendance(eventoId: number, asistencias: any[], userId: number) {
    // Validar que el evento existe
    const evento = await prisma.eventos.findFirst({
      where: { id_evento: eventoId, estado: true },
    });
    if (!evento) {
      throw new Error('El evento especificado no existe');
    }

    // Validar que todas las personas existen (evitar N+1 query)
    const personaIds = asistencias.map(a => a.id_persona);
    const personas = await prisma.personas.findMany({
      where: {
        id_persona: { in: personaIds },
        estado: true,
      },
      select: { id_persona: true },
    });

    const personasExistentes = new Set(personas.map(p => p.id_persona));
    const personasInvalidas = personaIds.filter(id => !personasExistentes.has(id));
    
    if (personasInvalidas.length > 0) {
      throw new Error(`Las siguientes personas no existen: ${personasInvalidas.join(', ')}`);
    }

    // Obtener registros existentes (evitar N+1 query)
    const existentes = await prisma.asistencia_eventos.findMany({
      where: {
        id_evento: eventoId,
        id_persona: { in: personaIds },
      },
    });

    const existentesMap = new Map(
      existentes.map(e => [e.id_persona, e])
    );

    const results = [];

    for (const asistencia of asistencias) {
      const existente = existentesMap.get(asistencia.id_persona);

      let registro;
      if (existente) {
        // Actualizar registro existente
        registro = await prisma.asistencia_eventos.update({
          where: { id_asistencia: existente.id_asistencia },
          data: {
            asistio: asistencia.asistio,
            observaciones: asistencia.observaciones,
          },
        });

        await auditoriaService.log(
          'ASISTENCIA_EVENTOS',
          registro.id_asistencia,
          'UPDATE',
          existente,
          registro,
          userId
        );
      } else {
        // Crear nuevo registro
        registro = await prisma.asistencia_eventos.create({
          data: {
            id_evento: eventoId,
            id_persona: asistencia.id_persona,
            asistio: asistencia.asistio,
            observaciones: asistencia.observaciones,
          },
        });

        await auditoriaService.log(
          'ASISTENCIA_EVENTOS',
          registro.id_asistencia,
          'INSERT',
          undefined,
          registro,
          userId
        );
      }

      results.push(registro);
    }

    return results;
  }

  async getAttendance(eventoId: number, page: number = 1, limit: number = 10) {
    // Validar que el evento existe
    const evento = await prisma.eventos.findFirst({
      where: { id_evento: eventoId, estado: true },
    });
    if (!evento) {
      throw new Error('El evento especificado no existe');
    }

    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [asistencias, total] = await Promise.all([
      prisma.asistencia_eventos.findMany({
        where: { id_evento: eventoId },
        skip,
        take: maxLimit,
        include: {
          persona: {
            select: {
              id_persona: true,
              primer_nombre: true,
              segundo_nombre: true,
              primer_apellido: true,
              segundo_apellido: true,
              email: true,
            },
          },
        },
        orderBy: [
          { asistio: 'desc' },
          { persona: { primer_apellido: 'asc' } },
        ],
      }),
      prisma.asistencia_eventos.count({ where: { id_evento: eventoId } }),
    ]);

    return {
      data: asistencias,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getAttendanceStats(
    eventoId?: number,
    ministerioId?: number,
    startDate?: string,
    endDate?: string
  ) {
    const whereClause: any = {};

    if (eventoId) {
      whereClause.id_evento = eventoId;
    }

    if (ministerioId || startDate || endDate) {
      whereClause.evento = {};
      
      if (ministerioId) {
        whereClause.evento.id_ministerio = ministerioId;
      }

      if (startDate || endDate) {
        whereClause.evento.fecha_inicio = {};
        if (startDate) {
          whereClause.evento.fecha_inicio.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.evento.fecha_inicio.lte = new Date(endDate);
        }
      }

      whereClause.evento.estado = true;
    }

    const [total, asistieron] = await Promise.all([
      prisma.asistencia_eventos.count({ where: whereClause }),
      prisma.asistencia_eventos.count({
        where: {
          ...whereClause,
          asistio: true,
        },
      }),
    ]);

    const porcentaje = total > 0 ? (asistieron / total) * 100 : 0;

    return {
      total_registrados: total,
      total_asistieron: asistieron,
      total_no_asistieron: total - asistieron,
      porcentaje_asistencia: Math.round(porcentaje * 100) / 100,
    };
  }
}
