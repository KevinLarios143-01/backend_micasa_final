import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../validators/usuarios.validator';
import { auditoriaService } from './auditoria.service';
import { BCRYPT_ROUNDS, PAGINATION } from '../utils/constants';
import { logger } from '../utils/logger';

class UsuariosService {
  async getAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await Promise.all([
      prisma.usuarios.findMany({
        where: filters,
        include: {
          persona: true,
        },
        skip,
        take: validLimit,
        orderBy: { fecha_creacion: 'desc' },
      }),
      prisma.usuarios.count({ where: filters }),
    ]);

    // Remove password from response
    const dataWithoutPassword = data.map(({ clave, ...user }) => user);

    return {
      data: dataWithoutPassword,
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
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: id },
      include: {
        persona: true,
      },
    });

    if (!user) return null;

    // Remove password from response
    const { clave, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(data: CreateUsuarioDTO, userId?: number) {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.clave, BCRYPT_ROUNDS);

    const usuario = await prisma.usuarios.create({
      data: {
        id_persona: data.id_persona,
        usuario: data.usuario,
        clave: hashedPassword,
        usuario_modificacion: userId,
      },
      include: {
        persona: true,
      },
    });

    // Log audit
    const { clave, ...usuarioWithoutPassword } = usuario;
    await auditoriaService.log(
      'USUARIOS',
      usuario.id_usuario,
      'INSERT',
      null,
      usuarioWithoutPassword,
      userId
    );

    return usuarioWithoutPassword;
  }

  async update(id: number, data: UpdateUsuarioDTO, userId?: number) {
    const oldData = await this.getById(id);

    if (!oldData) {
      throw new Error('Usuario no encontrado');
    }

    const usuario = await prisma.usuarios.update({
      where: { id_usuario: id },
      data: {
        ...data,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
      include: {
        persona: true,
      },
    });

    const { clave, ...usuarioWithoutPassword } = usuario;
    await auditoriaService.log(
      'USUARIOS',
      usuario.id_usuario,
      'UPDATE',
      oldData,
      usuarioWithoutPassword,
      userId
    );

    return usuarioWithoutPassword;
  }

  async delete(id: number, userId?: number) {
    const oldData = await this.getById(id);

    if (!oldData) {
      throw new Error('Usuario no encontrado');
    }

    await prisma.usuarios.update({
      where: { id_usuario: id },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });

    await auditoriaService.log('USUARIOS', id, 'DELETE', oldData, null, userId);
  }

  async assignRole(userId: number, roleId: number, assignedBy?: number) {
    // Get user and role details for logging
    const [usuario, rol] = await Promise.all([
      prisma.usuarios.findUnique({ where: { id_usuario: userId }, select: { usuario: true } }),
      prisma.roles.findUnique({ where: { id_rol: roleId }, select: { nombre: true } }),
    ]);

    // Check if assignment already exists
    const existing = await prisma.usuarios_roles.findFirst({
      where: {
        id_usuario: userId,
        id_rol: roleId,
      },
    });

    let result;
    if (existing) {
      // Reactivate if inactive
      if (!existing.estado) {
        result = await prisma.usuarios_roles.update({
          where: { id_usuario_rol: existing.id_usuario_rol },
          data: {
            estado: true,
            fecha_modificacion: new Date(),
            usuario_modificacion: assignedBy,
          },
        });

        // Log role reactivation
        logger.info('Rol reactivado para usuario', {
          usuarioId: userId,
          usuarioNombre: usuario?.usuario,
          roleId,
          rolNombre: rol?.nombre,
          asignadoPor: assignedBy,
          accion: 'reactivar_rol',
          timestamp: new Date().toISOString(),
        });
      } else {
        result = existing;
      }
    } else {
      // Create new assignment
      result = await prisma.usuarios_roles.create({
        data: {
          id_usuario: userId,
          id_rol: roleId,
          usuario_modificacion: assignedBy,
        },
      });

      // Log role assignment
      logger.info('Rol asignado a usuario', {
        usuarioId: userId,
        usuarioNombre: usuario?.usuario,
        roleId,
        rolNombre: rol?.nombre,
        asignadoPor: assignedBy,
        accion: 'asignar_rol',
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }

  async removeRole(userId: number, roleId: number, removedBy?: number) {
    // Get user and role details for logging
    const [usuario, rol] = await Promise.all([
      prisma.usuarios.findUnique({ where: { id_usuario: userId }, select: { usuario: true } }),
      prisma.roles.findUnique({ where: { id_rol: roleId }, select: { nombre: true } }),
    ]);

    const assignment = await prisma.usuarios_roles.findFirst({
      where: {
        id_usuario: userId,
        id_rol: roleId,
      },
    });

    if (!assignment) {
      throw new Error('Asignación de rol no encontrada');
    }

    const result = await prisma.usuarios_roles.update({
      where: { id_usuario_rol: assignment.id_usuario_rol },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: removedBy,
      },
    });

    // Log role removal
    logger.info('Rol removido de usuario', {
      usuarioId: userId,
      usuarioNombre: usuario?.usuario,
      roleId,
      rolNombre: rol?.nombre,
      removidoPor: removedBy,
      accion: 'remover_rol',
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async getUserRoles(userId: number) {
    const userRoles = await prisma.usuarios_roles.findMany({
      where: {
        id_usuario: userId,
        estado: true,
      },
      include: {
        roles: true,
      },
    });

    // Filter only active roles
    return userRoles.filter((ur) => ur.roles.estado);
  }

  async getUserPermissions(userId: number) {
    const userRoles = await prisma.usuarios_roles.findMany({
      where: {
        id_usuario: userId,
        estado: true,
      },
      include: {
        roles: {
          include: {
            roles_permisos: {
              include: {
                permisos: true,
              },
            },
          },
        },
      },
    });

    // Filter active roles and permissions
    const permissions = userRoles
      .filter((ur) => ur.roles.estado)
      .flatMap((ur) =>
        ur.roles.roles_permisos
          .filter((rp) => rp.estado && rp.permisos.estado)
          .map((rp) => rp.permisos)
      );

    // Remove duplicates
    const uniquePermissions = Array.from(
      new Map(permissions.map((p) => [p.id_permiso, p])).values()
    );

    return uniquePermissions;
  }
}

export const usuariosService = new UsuariosService();
