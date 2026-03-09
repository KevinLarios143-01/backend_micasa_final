import { PrismaClient } from '@prisma/client';
import { auditoriaService } from './auditoria.service';

const prisma = new PrismaClient();

export class MinisteriosService {
  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [ministerios, total] = await Promise.all([
      prisma.ministerio.findMany({
        where: { estado: true },
        skip,
        take: maxLimit,
        include: {
          lider: {
            select: {
              id_persona: true,
              primer_nombre: true,
              segundo_nombre: true,
              primer_apellido: true,
              segundo_apellido: true,
            },
          },
        },
        orderBy: { nombre: 'asc' },
      }),
      prisma.ministerio.count({ where: { estado: true } }),
    ]);

    return {
      data: ministerios,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getById(id: number) {
    const ministerio = await prisma.ministerio.findFirst({
      where: { id_ministerio: id, estado: true },
      include: {
        lider: {
          select: {
            id_persona: true,
            primer_nombre: true,
            segundo_nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
          },
        },
      },
    });

    if (!ministerio) {
      throw new Error('Ministerio no encontrado');
    }

    return ministerio;
  }

  async create(data: any, userId: number) {
    // Validar que el líder existe si se proporciona
    if (data.lider_id) {
      const lider = await prisma.personas.findFirst({
        where: { id_persona: data.lider_id, estado: true },
      });
      if (!lider) {
        throw new Error('El líder especificado no existe');
      }
    }

    const ministerio = await prisma.ministerio.create({
      data: {
        ...data,
        estado: true,
      },
    });

    await auditoriaService.log(
      'MINISTERIOS',
      ministerio.id_ministerio,
      'INSERT',
      undefined,
      ministerio,
      userId
    );

    return ministerio;
  }

  async update(id: number, data: any, userId: number) {
    const ministerioAnterior = await this.getById(id);

    // Validar que el líder existe si se proporciona
    if (data.lider_id) {
      const lider = await prisma.personas.findFirst({
        where: { id_persona: data.lider_id, estado: true },
      });
      if (!lider) {
        throw new Error('El líder especificado no existe');
      }
    }

    const ministerio = await prisma.ministerio.update({
      where: { id_ministerio: id },
      data,
    });

    await auditoriaService.log(
      'MINISTERIOS',
      ministerio.id_ministerio,
      'UPDATE',
      ministerioAnterior,
      ministerio,
      userId
    );

    return ministerio;
  }

  async delete(id: number, userId: number) {
    const ministerioAnterior = await this.getById(id);

    const ministerio = await prisma.ministerio.update({
      where: { id_ministerio: id },
      data: { estado: false },
    });

    await auditoriaService.log(
      'MINISTERIOS',
      ministerio.id_ministerio,
      'DELETE',
      ministerioAnterior,
      undefined,
      userId
    );

    return { message: 'Ministerio eliminado correctamente' };
  }

  async assignPerson(ministerioId: number, personaId: number, cargo: string | undefined, userId: number) {
    // Validar que el ministerio existe
    await this.getById(ministerioId);

    // Validar que la persona existe
    const persona = await prisma.personas.findFirst({
      where: { id_persona: personaId, estado: true },
    });
    if (!persona) {
      throw new Error('La persona especificada no existe');
    }

    // Verificar si ya existe la relación
    const existente = await prisma.ministerio_persona.findFirst({
      where: {
        id_ministerio: ministerioId,
        id_persona: personaId,
      },
    });

    let miembro;
    if (existente) {
      // Reactivar si estaba inactivo
      miembro = await prisma.ministerio_persona.update({
        where: { id_ministerio_persona: existente.id_ministerio_persona },
        data: {
          cargo,
          estado: true,
        },
      });
    } else {
      // Crear nueva relación
      miembro = await prisma.ministerio_persona.create({
        data: {
          id_ministerio: ministerioId,
          id_persona: personaId,
          cargo,
          estado: true,
        },
      });
    }

    await auditoriaService.log(
      'PERSONAS_MINISTERIOS',
      miembro.id_ministerio_persona,
      existente ? 'UPDATE' : 'INSERT',
      existente || undefined,
      miembro,
      userId
    );

    return miembro;
  }

  async removePerson(ministerioId: number, personaId: number, userId: number) {
    const miembro = await prisma.ministerio_persona.findFirst({
      where: {
        id_ministerio: ministerioId,
        id_persona: personaId,
        estado: true,
      },
    });

    if (!miembro) {
      throw new Error('El miembro no pertenece a este ministerio');
    }

    const miembroActualizado = await prisma.ministerio_persona.update({
      where: { id_ministerio_persona: miembro.id_ministerio_persona },
      data: { estado: false },
    });

    await auditoriaService.log(
      'PERSONAS_MINISTERIOS',
      miembro.id_ministerio_persona,
      'DELETE',
      miembro,
      miembroActualizado,
      userId
    );

    return { message: 'Miembro removido del ministerio correctamente' };
  }

  async getMembers(ministerioId: number, page: number = 1, limit: number = 10) {
    await this.getById(ministerioId);

    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [miembros, total] = await Promise.all([
      prisma.ministerio_persona.findMany({
        where: {
          id_ministerio: ministerioId,
          estado: true,
        },
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
        orderBy: { cargo: 'asc' },
      }),
      prisma.ministerio_persona.count({
        where: {
          id_ministerio: ministerioId,
          estado: true,
        },
      }),
    ]);

    return {
      data: miembros,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async updateMemberCargo(ministerioId: number, personaId: number, cargo: string | undefined, userId: number) {
    const miembro = await prisma.ministerio_persona.findFirst({
      where: {
        id_ministerio: ministerioId,
        id_persona: personaId,
        estado: true,
      },
    });

    if (!miembro) {
      throw new Error('El miembro no pertenece a este ministerio');
    }

    const miembroActualizado = await prisma.ministerio_persona.update({
      where: { id_ministerio_persona: miembro.id_ministerio_persona },
      data: { cargo },
    });

    await auditoriaService.log(
      'PERSONAS_MINISTERIOS',
      miembro.id_ministerio_persona,
      'UPDATE',
      miembro,
      miembroActualizado,
      userId
    );

    return miembroActualizado;
  }
}
