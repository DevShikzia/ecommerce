/**
 * Middleware de permisos
 * Verifica si el rol del usuario tiene permiso para acceder al endpoint
 */
import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/role.model';
import { Permission, PermissionAction } from '../models/permission.model';
import { AuthenticatedRequest } from './auth.middleware';
import { logger } from '../utils/logger';

const httpMethodToAction: Record<string, PermissionAction> = {
  GET: PermissionAction.GET,
  POST: PermissionAction.POST,
  PUT: PermissionAction.PUT,
  DELETE: PermissionAction.DELETE,
  PATCH: PermissionAction.PUT
};

export const checkPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.role) {
      res.status(403).json({
        success: false,
        message: 'Rol no definido para el usuario'
      });
      return;
    }

    const role = await Role.findOne({ name: req.user.role }).populate('permissions');

    if (!role) {
      res.status(403).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    const path = req.route?.path || req.path;
    const method = req.method.toUpperCase();
    const action = httpMethodToAction[method];

    const hasPermission = role.permissions.some((perm: any) => {
      const permResource = perm.resource.replace(/\/:[\w]+/g, '');
      const reqResource = path.replace(/\/:[\w]+/g, '');
      
      return (
        (permResource === reqResource || permResource === path) &&
        (perm.action === action || perm.action === PermissionAction.VIEW)
      );
    });

    if (!hasPermission) {
      logger.warn(`Acceso denegado: rol ${role.name} intento acceder a ${method} ${path}`);
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso'
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error en checkPermission:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};