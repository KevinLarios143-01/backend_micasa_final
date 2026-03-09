import { PrismaClient } from '@prisma/client';
import { auditoriaService } from './auditoria.service';

const prisma = new PrismaClient();

export class EventosService {
  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [eventos, total] = await Promise.all([
      prisma.eventos.findMany({
        where: { estado: true },
        skip,
        take: maxLimit,
        include: {
          ministerio: {
            select: {
              id_ministerio: true,
              nombre: true,
            },
          },
        },
        orderBy: { fecha_inicio: 'desc' },
      }),
      prisma.eventos.count({ where: { estado: true } }),
    ]);

    return {
      data: eventos,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getById(id: number) {
    const evento = await prisma.eventos.findFirst({
      where: { id_evento: id, estado: true },
      include: {
        ministerio: {
          select: {
            id_ministerio: true,
            nombre: true,
          },
        },
      },
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    return evento;
  }

  async create(data: any, userId: number) {
    // Validar que el ministerio existe si se proporciona
    if (data.id_ministerio) {
      const ministerio = await prisma.ministerio.findFirst({
        where: { id_ministerio: data.id_ministerio, estado: true },
      });
      if (!ministerio) {
        throw new Error('El ministerio especificado no existe');
      }
    }

    // Convertir strings de fecha a Date objects
    const eventoData = {
      ...data,
      fecha_inicio: new Date(data.fecha_inicio),
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
      estado: true,
    };

    const evento = await prisma.eventos.create({
      data: eventoData,
    });

    await auditoriaService.log(
      'EVENTOS',
      evento.id_evento,
      'INSERT',
      undefined,
      evento,
      userId
    );

    return evento;
  }

  async update(id: number, data: any, userId: number) {
    const eventoAnterior = await this.getById(id);

    // Validar que el ministerio existe si se proporciona
    if (data.id_ministerio) {
      const ministerio = await prisma.ministerio.findFirst({
        where: { id_ministerio: data.id_ministerio, estado: true },
      });
      if (!ministerio) {
        throw new Error('El ministerio especificado no existe');
      }
    }

    // Convertir strings de fecha a Date objects si están presentes
    const updateData: any = { ...data };
    if (data.fecha_inicio) {
      updateData.fecha_inicio = new Date(data.fecha_inicio);
    }
    if (data.fecha_fin) {
      updateData.fecha_fin = new Date(data.fecha_fin);
    }

    const evento = await prisma.eventos.update({
      where: { id_evento: id },
      data: updateData,
    });

    await auditoriaService.log(
      'EVENTOS',
      evento.id_evento,
      'UPDATE',
      eventoAnterior,
      evento,
      userId
    );

    return evento;
  }

  async delete(id: number, userId: number) {
    const eventoAnterior = await this.getById(id);

    const evento = await prisma.eventos.update({
      where: { id_evento: id },
      data: { estado: false },
    });

    await auditoriaService.log(
      'EVENTOS',
      evento.id_evento,
      'DELETE',
      eventoAnterior,
      undefined,
      userId
    );

    return { message: 'Evento eliminado correctamente' };
  }

  async getByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [eventos, total] = await Promise.all([
      prisma.eventos.findMany({
        where: {
          estado: true,
          fecha_inicio: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        skip,
        take: maxLimit,
        include: {
          ministerio: {
            select: {
              id_ministerio: true,
              nombre: true,
            },
          },
        },
        orderBy: { fecha_inicio: 'desc' },
      }),
      prisma.eventos.count({
        where: {
          estado: true,
          fecha_inicio: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      }),
    ]);

    return {
      data: eventos,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getByMinisterio(ministerioId: number, page: number = 1, limit: number = 10) {
    // Validar que el ministerio existe
    const ministerio = await prisma.ministerio.findFirst({
      where: { id_ministerio: ministerioId, estado: true },
    });
    if (!ministerio) {
      throw new Error('El ministerio especificado no existe');
    }

    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [eventos, total] = await Promise.all([
      prisma.eventos.findMany({
        where: {
          id_ministerio: ministerioId,
          estado: true,
        },
        skip,
        take: maxLimit,
        include: {
          ministerio: {
            select: {
              id_ministerio: true,
              nombre: true,
            },
          },
        },
        orderBy: { fecha_inicio: 'desc' },
      }),
      prisma.eventos.count({
        where: {
          id_ministerio: ministerioId,
          estado: true,
        },
      }),
    ]);

    return {
      data: eventos,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }
}
