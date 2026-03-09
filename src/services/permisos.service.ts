import { prisma } from '../config/database';
import { CreatePermisoDTO, UpdatePermisoDTO } from '../validators/permisos.validator';
import { auditoriaService } from './auditoria.service';
import { PAGINATION } from '../utils/constants';

class PermisosService {
  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await Promise.all([
      prisma.permisos.findMany({
        where: filters,
        skip,
        take: validLimit,
        orderBy: { modulo: 'asc' },
      }),
      prisma.permisos.count({ where: filters }),
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
    return await prisma.permisos.findUnique({
      where: { id_permiso: id },
    });
  }

  async getByModule(modulo: string) {
    return await prisma.permisos.findMany({
      where: {
        modulo,
        estado: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data: CreatePermisoDTO, userId?: number) {
    const permiso = await prisma.permisos.create({
      data: {
        ...data,
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('PERMISOS', permiso.id_permiso, 'INSERT', null, permiso, userId);
    return permiso;
  }

  async update(id: number, data: UpdatePermisoDTO, userId?: number) {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error('Permiso no encontrado');
    }

    const permiso = await prisma.permisos.update({
      where: { id_permiso: id },
      data: {
        ...data,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('PERMISOS', permiso.id_permiso, 'UPDATE', oldData, permiso, userId);
    return permiso;
  }

  async delete(id: number, userId?: number) {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error('Permiso no encontrado');
    }

    await prisma.permisos.update({
      where: { id_permiso: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('PERMISOS', id, 'DELETE', oldData, null, userId);
  }
}

export const permisosService = new PermisosService();
