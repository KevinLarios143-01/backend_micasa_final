import { prisma } from '../config/database';
import { CreateRolDTO, UpdateRolDTO } from '../validators/roles.validator';
import { auditoriaService } from './auditoria.service';
import { PAGINATION } from '../utils/constants';
import { logger } from '../utils/logger';

class RolesService {
  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await Promise.all([
      prisma.roles.findMany({
        where: filters,
        skip,
        take: validLimit,
        orderBy: { fecha_creacion: 'desc' },
      }),
      prisma.roles.count({ where: filters }),
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
    return await prisma.roles.findUnique({
      where: { id_rol: id },
    });
  }

  async create(data: CreateRolDTO, userId?: number) {
    const rol = await prisma.roles.create({
      data: {
        ...data,
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('ROLES', rol.id_rol, 'INSERT', null, rol, userId);
    return rol;
  }

  async update(id: number, data: UpdateRolDTO, userId?: number) {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error('Rol no encontrado');
    }

    const rol = await prisma.roles.update({
      where: { id_rol: id },
      data: {
        ...data,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('ROLES', rol.id_rol, 'UPDATE', oldData, rol, userId);
    return rol;
  }

  async delete(id: number, userId?: number) {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error('Rol no encontrado');
    }

    await prisma.roles.update({
      where: { id_rol: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('ROLES', id, 'DELETE', oldData, null, userId);
  }

  async assignPermission(rolId: number, permisoId: number, assignedBy?: number) {
    // Get role and permission details for logging
    const [rol, permiso] = await Promise.all([
      prisma.roles.findUnique({ where: { id_rol: rolId } }),
      prisma.permisos.findUnique({ where: { id_permiso: permisoId } }),
    ]);

    const existing = await prisma.roles_permisos.findFirst({
      where: { id_rol: rolId, id_permiso: permisoId },
    });

    let result;
    if (existing) {
      if (!existing.estado) {
        result = await prisma.roles_permisos.update({
          where: { id_rol_permiso: existing.id_rol_permiso },
          data: {
            estado: true,
            fecha_modificacion: new Date(),
            usuario_modificacion: assignedBy,
          },
        });

        // Log permission reactivation
        logger.info('Permiso reactivado en rol', {
          rolId,
          rolNombre: rol?.nombre,
          permisoId,
          permisoNombre: permiso?.nombre,
          usuarioId: assignedBy,
          accion: 'reactivar_permiso',
          timestamp: new Date().toISOString(),
        });
      } else {
        result = existing;
      }
    } else {
      result = await prisma.roles_permisos.create({
        data: {
          id_rol: rolId,
          id_permiso: permisoId,
          usuario_modificacion: assignedBy,
        },
      });

      // Log permission assignment
      logger.info('Permiso asignado a rol', {
        rolId,
        rolNombre: rol?.nombre,
        permisoId,
        permisoNombre: permiso?.nombre,
        usuarioId: assignedBy,
        accion: 'asignar_permiso',
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }

  async removePermission(rolId: number, permisoId: number, removedBy?: number) {
    // Get role and permission details for logging
    const [rol, permiso] = await Promise.all([
      prisma.roles.findUnique({ where: { id_rol: rolId } }),
      prisma.permisos.findUnique({ where: { id_permiso: permisoId } }),
    ]);

    const assignment = await prisma.roles_permisos.findFirst({
      where: { id_rol: rolId, id_permiso: permisoId },
    });

    if (!assignment) {
      throw new Error('Asignación de permiso no encontrada');
    }

    const result = await prisma.roles_permisos.update({
      where: { id_rol_permiso: assignment.id_rol_permiso },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: removedBy,
      },
    });

    // Log permission removal
    logger.info('Permiso removido de rol', {
      rolId,
      rolNombre: rol?.nombre,
      permisoId,
      permisoNombre: permiso?.nombre,
      usuarioId: removedBy,
      accion: 'remover_permiso',
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async getRolePermissions(rolId: number) {
    const rolePermisos = await prisma.roles_permisos.findMany({
      where: {
        id_rol: rolId,
        estado: true,
      },
      include: {
        permisos: true,
      },
    });

    // Filter only active permisos
    return rolePermisos.filter((rp) => rp.permisos.estado);
  }
}

export const rolesService = new RolesService();
