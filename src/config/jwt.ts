import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Validate existence
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
}

// Validate strength in production
if (process.env.NODE_ENV === 'production') {
  // Validate minimum length (32 characters recommended)
  if (JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  
  if (REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters in production');
  }
  
  // Validate that default values are not used
  const weakSecrets = [
    'your-super-secret-jwt-key-change-this-in-production',
    'your-refresh-token-secret',
    'secret',
    'password',
    '12345678',
  ];
  
  if (weakSecrets.includes(JWT_SECRET)) {
    throw new Error('JWT_SECRET cannot use a default value in production');
  }
  
  if (weakSecrets.includes(REFRESH_TOKEN_SECRET)) {
    throw new Error('REFRESH_TOKEN_SECRET cannot use a default value in production');
  }
}

// Warning in development
if (process.env.NODE_ENV === 'development') {
  const weakSecrets = [
    'your-super-secret-jwt-key-change-this-in-production',
    'your-refresh-token-secret',
  ];
  
  if (weakSecrets.includes(JWT_SECRET) || weakSecrets.includes(REFRESH_TOKEN_SECRET)) {
    console.warn('⚠️  WARNING: Using default JWT secrets. Change before production deployment.');
  }
}

export interface JWTPayload {
  userId: number;
  personaId: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
};
