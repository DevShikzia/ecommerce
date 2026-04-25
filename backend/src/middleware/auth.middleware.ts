/**
 * Middleware de autenticación JWT
 * Verifica el token de acceso y adjunta el usuario a la petición
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { User } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No se encontró un token en la cabecera de autorización',
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
      email: string;
    };

    const user = await User.findById(decoded.userId).populate('role');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: (user.role as any)?.name || decoded.role,
      name: user.name,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    logger.error('Error en authMiddleware:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};