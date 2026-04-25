/**
 * Middleware centralizado para manejo de errores
 */
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response<ApiResponse<null>>,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  logger.error(`${statusCode} - ${message}`, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const notFoundMiddleware = (
  req: Request,
  res: Response<ApiResponse<null>>
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};