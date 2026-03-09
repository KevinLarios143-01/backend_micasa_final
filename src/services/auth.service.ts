import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { generateToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../config/jwt';
import { AuthResult, LoginDTO, ChangePasswordDTO } from '../types/auth.types';
import { BCRYPT_ROUNDS } from '../utils/constants';
import { logger } from '../utils/logger';

class AuthService {
  async login(loginData: LoginDTO, ipAddress?: string): Promise<AuthResult> {
    const { usuario, clave } = loginData;

    // Find user with related data
    const user = await prisma.usuarios.findUnique({
      where: { usuario },
      include: {
        persona: true,
        usuarios_roles: {
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
        },
      },
    });

    // Validate user exists and is active
    if (!user || !user.estado) {
      // Log failed login attempt - user not found or inactive
      logger.warn('Intento de login fallido: usuario no encontrado o inactivo', {
        usuario,
        ip: ipAddress,
        razon: 'usuario_no_encontrado_o_inactivo',
        timestamp: new Date().toISOString(),
      });
      throw new Error('Credenciales inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(clave, user.clave);
    if (!isPasswordValid) {
      // Log failed login attempt - invalid password
      logger.warn('Intento de login fallido: contraseña incorrecta', {
        usuario,
        userId: user.id_usuario,
        ip: ipAddress,
        razon: 'contraseña_incorrecta',
        timestamp: new Date().toISOString(),
      });
      throw new Error('Credenciales inválidas');
    }

    // Extract active roles
    const roles = user.usuarios_roles
      .filter((ur) => ur.estado && ur.roles.estado)
      .map((ur) => ur.roles.nombre);

    // Extract active permissions (unique)
    const permissions = user.usuarios_roles
      .filter((ur) => ur.estado && ur.roles.estado)
      .flatMap((ur) =>
        ur.roles.roles_permisos
          .filter((rp) => rp.estado && rp.permisos.estado)
          .map((rp) => rp.permisos.nombre)
      );
    const uniquePermissions = [...new Set(permissions)];

    // Create JWT payload
    const payload: JWTPayload = {
      userId: user.id_usuario,
      personaId: user.id_persona,
      username: user.usuario,
      roles,
      permissions: uniquePermissions,
    };

    // Generate tokens
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Update last access
    await prisma.usuarios.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_acceso: new Date() },
    });

    // Log successful login
    logger.info('Login exitoso', {
      usuario: user.usuario,
      userId: user.id_usuario,
      ip: ipAddress,
      timestamp: new Date().toISOString(),
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id_usuario,
        username: user.usuario,
        persona: user.persona,
        roles,
        permissions: uniquePermissions,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await prisma.usuarios.findUnique({
        where: { id_usuario: payload.userId },
      });

      if (!user || !user.estado) {
        throw new Error('Usuario inactivo o no encontrado');
      }

      // Generate new tokens
      const newToken = generateToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Token de refresco inválido o expirado');
    }
  }

  async changePassword(userId: number, passwordData: ChangePasswordDTO): Promise<void> {
    const { claveActual, claveNueva } = passwordData;

    // Get user
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(claveActual, user.clave);
    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(claveNueva, BCRYPT_ROUNDS);

    // Update password
    await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: {
        clave: hashedPassword,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,
      },
    });
  }

  async getCurrentUser(userId: number) {
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
      include: {
        persona: true,
        usuarios_roles: {
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
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Extract roles and permissions
    const roles = user.usuarios_roles
      .filter((ur) => ur.estado && ur.roles.estado)
      .map((ur) => ur.roles.nombre);

    const permissions = user.usuarios_roles
      .filter((ur) => ur.estado && ur.roles.estado)
      .flatMap((ur) =>
        ur.roles.roles_permisos
          .filter((rp) => rp.estado && rp.permisos.estado)
          .map((rp) => rp.permisos.nombre)
      );
    const uniquePermissions = [...new Set(permissions)];

    // Remove password from response
    const { clave, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      roles,
      permissions: uniquePermissions,
    };
  }
}

export const authService = new AuthService();
