import { prisma } from '../config/database';

class AuditoriaService {
  async log(
    tabla: string,
    idRegistro: number,
    accion: 'INSERT' | 'UPDATE' | 'DELETE',
    datosAnteriores: any,
    datosNuevos: any,
    idUsuario?: number
  ): Promise<void> {
    try {
      await prisma.auditoria.create({
        data: {
          tabla,
          id_registro: idRegistro,
          accion,
          datos_anteriores: datosAnteriores,
          datos_nuevos: datosNuevos,
          id_usuario: idUsuario,
          fecha_accion: new Date(),
        },
      });
    } catch (error) {
      // Log error but don't throw to avoid breaking the main operation
      console.error('Error logging audit:', error);
    }
  }

  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: filters,
        include: {
          usuario: {
            select: {
              id_usuario: true,
              usuario: true,
              persona: {
                select: {
                  primer_nombre: true,
                  primer_apellido: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { fecha_accion: 'desc' },
      }),
      prisma.auditoria.count({ where: filters }),
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getByTable(tabla: string, page: number = 1, limit: number = 10) {
    return this.getAll(page, limit, { tabla });
  }

  async getByUser(idUsuario: number, page: number = 1, limit: number = 10) {
    return this.getAll(page, limit, { id_usuario: idUsuario });
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10
  ) {
    return this.getAll(page, limit, {
      fecha_accion: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  async getByRecord(tabla: string, idRegistro: number) {
    return prisma.auditoria.findMany({
      where: {
        tabla,
        id_registro: idRegistro,
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            usuario: true,
            persona: {
              select: {
                primer_nombre: true,
                primer_apellido: true,
              },
            },
          },
        },
      },
      orderBy: { fecha_accion: 'asc' },
    });
  }
}

export const auditoriaService = new AuditoriaService();
