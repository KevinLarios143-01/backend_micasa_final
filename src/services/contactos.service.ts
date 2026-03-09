import { PrismaClient } from '@prisma/client';
import { auditoriaService } from './auditoria.service';

const prisma = new PrismaClient();

export class ContactosService {
  async getByPersona(personaId: number, page: number = 1, limit: number = 10) {
    // Validar que la persona existe
    const persona = await prisma.personas.findFirst({
      where: { id_persona: personaId, estado: true },
    });
    if (!persona) {
      throw new Error('La persona especificada no existe');
    }

    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [contactos, total] = await Promise.all([
      prisma.contactos.findMany({
        where: {
          id_persona: personaId,
          estado: true,
        },
        skip,
        take: maxLimit,
        orderBy: [
          { es_principal: 'desc' },
          { tipo_contacto: 'asc' },
        ],
      }),
      prisma.contactos.count({
        where: {
          id_persona: personaId,
          estado: true,
        },
      }),
    ]);

    return {
      data: contactos,
      metadata: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async getById(id: number) {
    const contacto = await prisma.contactos.findFirst({
      where: { id_contacto: id, estado: true },
      include: {
        persona: {
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

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    return contacto;
  }

  async create(data: any, userId: number) {
    // Validar que la persona existe
    const persona = await prisma.personas.findFirst({
      where: { id_persona: data.id_persona, estado: true },
    });
    if (!persona) {
      throw new Error('La persona especificada no existe');
    }

    // Si se marca como principal, validar que no exista otro principal del mismo tipo
    if (data.es_principal) {
      const principalExistente = await prisma.contactos.findFirst({
        where: {
          id_persona: data.id_persona,
          tipo_contacto: data.tipo_contacto,
          es_principal: true,
          estado: true,
        },
      });

      if (principalExistente) {
        throw new Error(`Ya existe un contacto principal de tipo ${data.tipo_contacto} para esta persona`);
      }
    }

    const contacto = await prisma.contactos.create({
      data: {
        ...data,
        estado: true,
      },
    });

    await auditoriaService.log(
      'CONTACTOS',
      contacto.id_contacto,
      'INSERT',
      undefined,
      contacto,
      userId
    );

    return contacto;
  }

  async update(id: number, data: any, userId: number) {
    const contactoAnterior = await this.getById(id);

    // Si se marca como principal, validar que no exista otro principal del mismo tipo
    if (data.es_principal) {
      const tipoContacto = data.tipo_contacto || contactoAnterior.tipo_contacto;
      const principalExistente = await prisma.contactos.findFirst({
        where: {
          id_persona: contactoAnterior.id_persona,
          tipo_contacto: tipoContacto,
          es_principal: true,
          estado: true,
          id_contacto: { not: id },
        },
      });

      if (principalExistente) {
        throw new Error(`Ya existe un contacto principal de tipo ${tipoContacto} para esta persona`);
      }
    }

    const contacto = await prisma.contactos.update({
      where: { id_contacto: id },
      data,
    });

    await auditoriaService.log(
      'CONTACTOS',
      contacto.id_contacto,
      'UPDATE',
      contactoAnterior,
      contacto,
      userId
    );

    return contacto;
  }

  async delete(id: number, userId: number) {
    const contactoAnterior = await this.getById(id);

    const contacto = await prisma.contactos.update({
      where: { id_contacto: id },
      data: { estado: false },
    });

    await auditoriaService.log(
      'CONTACTOS',
      contacto.id_contacto,
      'DELETE',
      contactoAnterior,
      undefined,
      userId
    );

    return { message: 'Contacto eliminado correctamente' };
  }

  async setPrincipal(id: number, userId: number) {
    const contacto = await this.getById(id);

    // Desmarcar otros contactos principales del mismo tipo
    await prisma.contactos.updateMany({
      where: {
        id_persona: contacto.id_persona,
        tipo_contacto: contacto.tipo_contacto,
        es_principal: true,
        estado: true,
        id_contacto: { not: id },
      },
      data: { es_principal: false },
    });

    // Marcar este como principal
    const contactoActualizado = await prisma.contactos.update({
      where: { id_contacto: id },
      data: { es_principal: true },
    });

    await auditoriaService.log(
      'CONTACTOS',
      contacto.id_contacto,
      'UPDATE',
      contacto,
      contactoActualizado,
      userId
    );

    return contactoActualizado;
  }
}
