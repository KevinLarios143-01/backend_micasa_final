import { PrismaClient } from '@prisma/client';
import { auditoriaService } from './auditoria.service';

const prisma = new PrismaClient();

export class FamiliasService {
  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [familias, total] = await Promise.all([
      prisma.familia.findMany({
        where: { estado: true },
        skip,
        take: maxLimit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.familia.count({ where: { estado: true } }),
    ]);

    return {
      data: familias,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getById(id: number) {
    const familia = await prisma.familia.findFirst({
      where: { id_familia: id, estado: true },
    });

    if (!familia) {
      throw new Error('Familia no encontrada');
    }

    return familia;
  }

  async create(data: any, userId: number) {
    const familia = await prisma.familia.create({
      data: {
        ...data,
        estado: true,
      },
    });

    await auditoriaService.log(
      'FAMILIAS',
      familia.id_familia,
      'INSERT',
      undefined,
      familia,
      userId
    );

    return familia;
  }

  async update(id: number, data: any, userId: number) {
    const familiaAnterior = await this.getById(id);

    const familia = await prisma.familia.update({
      where: { id_familia: id },
      data,
    });

    await auditoriaService.log(
      'FAMILIAS',
      familia.id_familia,
      'UPDATE',
      familiaAnterior,
      familia,
      userId
    );

    return familia;
  }

  async delete(id: number, userId: number) {
    const familiaAnterior = await this.getById(id);

    const familia = await prisma.familia.update({
      where: { id_familia: id },
      data: { estado: false },
    });

    await auditoriaService.log(
      'FAMILIAS',
      familia.id_familia,
      'DELETE',
      familiaAnterior,
      undefined,
      userId
    );

    return { message: 'Familia eliminada correctamente' };
  }

  async addMember(familiaId: number, personaId: number, parentesco: string, esCabezaFamilia: boolean, userId: number) {
    // Validar que la familia existe
    await this.getById(familiaId);

    // Validar que la persona existe
    const persona = await prisma.personas.findFirst({
      where: { id_persona: personaId, estado: true },
    });
    if (!persona) {
      throw new Error('La persona especificada no existe');
    }

    // Si se intenta marcar como cabeza de familia, validar que no exista otra
    if (esCabezaFamilia) {
      const cabezaExistente = await prisma.familia_persona.findFirst({
        where: {
          id_familia: familiaId,
          es_cabeza_familia: true,
          // No incluir estado aquí para validar incluso inactivos
        },
      });

      if (cabezaExistente) {
        throw new Error('Ya existe una cabeza de familia para esta familia');
      }
    }

    // Verificar si ya existe la relación
    const existente = await prisma.familia_persona.findFirst({
      where: {
        id_familia: familiaId,
        id_persona: personaId,
      },
    });

    let miembro;
    if (existente) {
      // Reactivar si estaba inactivo
      miembro = await prisma.familia_persona.update({
        where: { id_familia_persona: existente.id_familia_persona },
        data: {
          parentesco,
          es_cabeza_familia: esCabezaFamilia,
        },
      });
    } else {
      // Crear nueva relación
      miembro = await prisma.familia_persona.create({
        data: {
          id_familia: familiaId,
          id_persona: personaId,
          parentesco,
          es_cabeza_familia: esCabezaFamilia,
        },
      });
    }

    await auditoriaService.log(
      'PERSONAS_FAMILIAS',
      miembro.id_familia_persona,
      existente ? 'UPDATE' : 'INSERT',
      existente || undefined,
      miembro,
      userId
    );

    return miembro;
  }

  async removeMember(familiaId: number, personaId: number, userId: number) {
    const miembro = await prisma.familia_persona.findFirst({
      where: {
        id_familia: familiaId,
        id_persona: personaId,
      },
    });

    if (!miembro) {
      throw new Error('El miembro no pertenece a esta familia');
    }

    // Eliminar el registro (no hay campo estado en familia_persona)
    await prisma.familia_persona.delete({
      where: { id_familia_persona: miembro.id_familia_persona },
    });

    await auditoriaService.log(
      'PERSONAS_FAMILIAS',
      miembro.id_familia_persona,
      'DELETE',
      miembro,
      undefined,
      userId
    );

    return { message: 'Miembro removido de la familia correctamente' };
  }

  async getMembers(familiaId: number, page: number = 1, limit: number = 10) {
    await this.getById(familiaId);

    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [miembros, total] = await Promise.all([
      prisma.familia_persona.findMany({
        where: {
          id_familia: familiaId,
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
              genero: true,
            },
          },
        },
        orderBy: [
          { es_cabeza_familia: 'desc' },
          { parentesco: 'asc' },
        ],
      }),
      prisma.familia_persona.count({
        where: {
          id_familia: familiaId,
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

  async updateMemberParentesco(
    familiaId: number,
    personaId: number,
    parentesco: string,
    esCabezaFamilia: boolean | undefined,
    userId: number
  ) {
    const miembro = await prisma.familia_persona.findFirst({
      where: {
        id_familia: familiaId,
        id_persona: personaId,
      },
    });

    if (!miembro) {
      throw new Error('El miembro no pertenece a esta familia');
    }

    // Si se intenta marcar como cabeza de familia, validar que no exista otra
    if (esCabezaFamilia && !miembro.es_cabeza_familia) {
      const cabezaExistente = await prisma.familia_persona.findFirst({
        where: {
          id_familia: familiaId,
          es_cabeza_familia: true,
          id_familia_persona: { not: miembro.id_familia_persona },
        },
      });

      if (cabezaExistente) {
        throw new Error('Ya existe una cabeza de familia para esta familia');
      }
    }

    const updateData: any = { parentesco };
    if (esCabezaFamilia !== undefined) {
      updateData.es_cabeza_familia = esCabezaFamilia;
    }

    const miembroActualizado = await prisma.familia_persona.update({
      where: { id_familia_persona: miembro.id_familia_persona },
      data: updateData,
    });

    await auditoriaService.log(
      'PERSONAS_FAMILIAS',
      miembro.id_familia_persona,
      'UPDATE',
      miembro,
      miembroActualizado,
      userId
    );

    return miembroActualizado;
  }
}
