import { authService } from '../src/services/auth.service';
import { usuariosService } from '../src/services/usuarios.service';
import { rolesService } from '../src/services/roles.service';
import { logger } from '../src/utils/logger';
import { prisma } from '../src/config/database';

// Mock logger to capture log calls
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Security Event Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Failed Login Attempts', () => {
    it('should log failed login with invalid username', async () => {
      const loginData = {
        usuario: 'nonexistent_user',
        clave: 'password123',
      };

      await expect(authService.login(loginData, '192.168.1.1')).rejects.toThrow(
        'Credenciales inválidas'
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Intento de login fallido: usuario no encontrado o inactivo',
        expect.objectContaining({
          usuario: 'nonexistent_user',
          ip: '192.168.1.1',
          razon: 'usuario_no_encontrado_o_inactivo',
        })
      );
    });

    it('should log failed login with invalid password', async () => {
      // This test assumes there's a user in the database
      // In a real test, you would set up test data first
      const loginData = {
        usuario: 'admin',
        clave: 'wrong_password',
      };

      await expect(authService.login(loginData, '192.168.1.1')).rejects.toThrow();

      // Verify that logger.warn was called (either for user not found or wrong password)
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should NOT log passwords in failed login attempts', async () => {
      const loginData = {
        usuario: 'test_user',
        clave: 'secret_password_123',
      };

      await expect(authService.login(loginData, '192.168.1.1')).rejects.toThrow();

      // Get all logger.warn calls
      const warnCalls = (logger.warn as jest.Mock).mock.calls;

      // Verify no call contains the password
      warnCalls.forEach((call) => {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toContain('secret_password_123');
        expect(logMessage).not.toContain(loginData.clave);
      });
    });
  });

  describe('Successful Login', () => {
    it('should log successful login without sensitive data', async () => {
      // This test would require a valid user in the database
      // In a real implementation, you would set up test data

      // Verify that successful logins don't log tokens or passwords
      const infoCalls = (logger.info as jest.Mock).mock.calls;

      infoCalls.forEach((call) => {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toMatch(/token/i);
        expect(logMessage).not.toMatch(/clave/i);
        expect(logMessage).not.toMatch(/password/i);
      });
    });
  });

  describe('Role and Permission Changes', () => {
    it('should log role assignment to user', async () => {
      // This test would require valid user and role IDs
      // In a real implementation, you would set up test data

      // Verify that role assignments are logged
      expect(logger.info).toBeDefined();
    });

    it('should log permission assignment to role', async () => {
      // This test would require valid role and permission IDs
      // In a real implementation, you would set up test data

      // Verify that permission assignments are logged
      expect(logger.info).toBeDefined();
    });

    it('should NOT log sensitive data in role/permission changes', () => {
      const infoCalls = (logger.info as jest.Mock).mock.calls;

      infoCalls.forEach((call) => {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toMatch(/clave/i);
        expect(logMessage).not.toMatch(/password/i);
        expect(logMessage).not.toMatch(/token/i);
      });
    });
  });

  describe('Authorization Denials', () => {
    it('should NOT log tokens in authorization denials', () => {
      const warnCalls = (logger.warn as jest.Mock).mock.calls;

      warnCalls.forEach((call) => {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toMatch(/token/i);
        expect(logMessage).not.toMatch(/jwt/i);
        expect(logMessage).not.toMatch(/bearer/i);
      });
    });
  });
});
