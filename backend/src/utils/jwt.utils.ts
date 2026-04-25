/**
 * Utilidades para manejo de JWT
 * Genera y verifica Access Token y Refresh Token
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const COOKIE_NAME = 'refreshToken';

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Error verifying access token:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    return null;
  }
};

export const generateTokens = (
  userId: string,
  email: string,
  role: string
): { accessToken: string; refreshToken: string } => {
  const payload: TokenPayload = { userId, email, role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

export interface RefreshTokenCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export const getRefreshTokenCookieOptions = (): RefreshTokenCookieOptions => {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: sevenDaysMs,
    path: '/',
  };
};

export { COOKIE_NAME };