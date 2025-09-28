import jwt from "jsonwebtoken";
import { env } from "../env";
import type { UserRole } from "../../generated/prisma";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  hospitalId?: number;
  departmentId?: number;
  permissions?: string[];
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generates JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_SECRET,
    {
      expiresIn: `${env.SESSION_MAX_AGE}s`,
      issuer: 'medcare',
      audience: 'medcare-users',
    }
  );
}

/**
 * Generates JWT refresh token
 */
export function generateRefreshToken(payload: Pick<JWTPayload, 'userId' | 'sessionId'>): string {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: `${env.REFRESH_TOKEN_MAX_AGE}s`,
      issuer: 'medcare',
      audience: 'medcare-users',
    }
  );
}

/**
 * Generates both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const sessionId = payload.sessionId || generateSessionId();
  
  const accessToken = generateAccessToken({ ...payload, sessionId });
  const refreshToken = generateRefreshToken({ 
    userId: payload.userId, 
    sessionId 
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.SESSION_MAX_AGE,
  };
}

/**
 * Verifies and decodes JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'medcare',
      audience: 'medcare-users',
    }) as any;

    if (decoded.type !== 'access') {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      hospitalId: decoded.hospitalId,
      departmentId: decoded.departmentId,
      permissions: decoded.permissions,
      sessionId: decoded.sessionId,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Verifies and decodes JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'medcare',
      audience: 'medcare-users',
    }) as any;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generates a unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Extracts token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Creates a JWT token for password reset
 */
export function generatePasswordResetToken(email: string): string {
  return jwt.sign(
    {
      email,
      type: 'password-reset',
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: 'medcare',
      audience: 'medcare-users',
    }
  );
}

/**
 * Verifies password reset token
 */
export function verifyPasswordResetToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'medcare',
      audience: 'medcare-users',
    }) as any;

    if (decoded.type !== 'password-reset') {
      return null;
    }

    return {
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Creates a JWT token for email verification
 */
export function generateEmailVerificationToken(email: string): string {
  return jwt.sign(
    {
      email,
      type: 'email-verification',
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'medcare',
      audience: 'medcare-users',
    }
  );
}

/**
 * Verifies email verification token
 */
export function verifyEmailVerificationToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'medcare',
      audience: 'medcare-users',
    }) as any;

    if (decoded.type !== 'email-verification') {
      return null;
    }

    return {
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}