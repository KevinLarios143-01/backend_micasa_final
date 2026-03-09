import { prisma } from '../config/database';
import { CreatePersonaDTO, UpdatePersonaDTO } from '../validators/personas.validator';
import { auditoriaService } from './auditoria.service';
import { PAGINATION } from '../utils/constants';

class PersonasService {
  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await Promise.all([
      prisma.personas.findMany({
        where: filters,
        skip,
        take: validLimit,
        orderBy: { fecha_creacion: 'desc' },
      }),
      prisma.personas.count({ where: filters }),
    ]);

    return {
      data,
      metadata: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
        hasNextPage: validPage < Math.ceil(total / validLimit),
        hasPrevPage: validPage > 1,
      },
    };
  }

  async getById(id: number) {
    return await prisma.personas.findUnique({
      where: { id_persona: id },
    });
  }

  async getByIdentificacion(identificacion: string) {
    return await prisma.personas.findUnique({
      where: { identificacion },
    });
  }

  async search(searchTerm: string, page: number = 1, limit: number = 10) {
    return this.getAll(page, limit, {
      OR: [
        { primer_nombre: { contains: searchTerm, mode: 'insensitive' } },
        { segundo_nombre: { contains: searchTerm, mode: 'insensitive' } },
        { tercer_nombre: { contains: searchTerm, mode: 'insensitive' } },
        { primer_apellido: { contains: searchTerm, mode: 'insensitive' } },
        { segundo_apellido: { contains: searchTerm, mode: 'insensitive' } },
        { identificacion: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  async create(data: CreatePersonaDTO, userId?: number) {
    // Convert date strings to Date objects
    const personaData = {
      ...data,
      fecha_nacimiento: new Date(data.fecha_nacimiento),
      fecha_bautizo: data.fecha_bautizo ? new Date(data.fecha_bautizo) : null,
      usuario_modificacion: userId,
    };

    const persona = await prisma.personas.create({
      data: personaData,
    });

    // Log audit
    await auditoriaService.log(
      'PERSONAS',
      persona.id_persona,
      'INSERT',
      null,
      persona,
      userId
    );

    return persona;
  }

  async update(id: number, data: UpdatePersonaDTO, userId?: number) {
    // Get old data for audit
    const oldData = await this.getById(id);

    if (!oldData) {
      throw new Error('Persona no encontrada');
    }

    // Convert date strings to Date objects if present
    const updateData: any = { ...data };
    if (data.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(data.fecha_nacimiento);
    }
    if (data.fecha_bautizo) {
      updateData.fecha_bautizo = new Date(data.fecha_bautizo);
    }

    const persona = await prisma.personas.update({
      where: { id_persona: id },
      data: {
        ...updateData,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    // Log audit
    await auditoriaService.log(
      'PERSONAS',
      persona.id_persona,
      'UPDATE',
      oldData,
      persona,
      userId
    );

    return persona;
  }

  async delete(id: number, userId?: number) {
    // Get old data for audit
    const oldData = await this.getById(id);

    if (!oldData) {
      throw new Error('Persona no encontrada');
    }

    // Soft delete
    await prisma.personas.update({
      where: { id_persona: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    // Log audit
    await auditoriaService.log(
      'PERSONAS',
      id,
      'DELETE',
      oldData,
      null,
      userId
    );
  }
}

export const personasService = new PersonasService();
