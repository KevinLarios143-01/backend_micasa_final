import { personas } from '@prisma/client';

export interface LoginDTO {
  usuario: string;
  clave: string;
}

export interface ChangePasswordDTO {
  claveActual: string;
  claveNueva: string;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    persona: personas;
    roles: string[];
    permissions: string[];
  };
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
