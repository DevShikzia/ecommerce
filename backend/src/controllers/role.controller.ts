/**
 * Controlador de roles
 * Gestiona las operaciones CRUD de roles
 */
import { Response } from 'express';
import { roleService } from '../services/role.service';
import { ApiResponse } from '../types/api-response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IRoleDocument } from '../models/role.model';

interface RoleResponse {
  _id: string;
  name: string;
  permissions: unknown[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoleListResponse {
  _id: string;
  name: string;
  permissions: unknown[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoleController {
  async getRoles(_req: AuthenticatedRequest, res: Response<ApiResponse<RoleListResponse[]>>): Promise<void> {
    try {
      const roles = await roleService.findAll() as IRoleDocument[];
      const response: RoleListResponse[] = roles.map(role => ({
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }));
      res.status(200).json({ success: true, data: response });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener roles';
      res.status(500).json({ success: false, message });
    }
  }

  async getRoleById(req: AuthenticatedRequest, res: Response<ApiResponse<RoleResponse>>): Promise<void> {
    try {
      const role = await roleService.findById(req.params.id) as IRoleDocument;
      const response: RoleResponse = {
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      res.status(200).json({ success: true, data: response });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener rol';
      const status = message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  async createRole(req: AuthenticatedRequest, res: Response<ApiResponse<RoleResponse>>): Promise<void> {
    try {
      const { name, permissions, description } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'El nombre del rol es requerido' });
        return;
      }
      const role = await roleService.create({ name, permissions, description }) as IRoleDocument;
      const response: RoleResponse = {
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      res.status(201).json({ success: true, data: response, message: 'Rol creado correctamente' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear rol';
      res.status(400).json({ success: false, message });
    }
  }

  async updateRole(req: AuthenticatedRequest, res: Response<ApiResponse<RoleResponse>>): Promise<void> {
    try {
      const { name, permissions, description } = req.body;
      const role = await roleService.update(req.params.id, { name, permissions, description }) as IRoleDocument;
      const response: RoleResponse = {
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      res.status(200).json({ success: true, data: response, message: 'Rol actualizado correctamente' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar rol';
      const status = message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  async deleteRole(req: AuthenticatedRequest, res: Response<ApiResponse<boolean>>): Promise<void> {
    try {
      const role = await roleService.findById(req.params.id) as IRoleDocument;
      if (role.name === 'admin') {
        res.status(403).json({ success: false, message: 'No se puede eliminar el rol admin' });
        return;
      }
      await roleService.delete(req.params.id);
      res.status(200).json({ success: true, data: true, message: 'Rol eliminado correctamente' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar rol';
      const status = message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  async addPermissions(req: AuthenticatedRequest, res: Response<ApiResponse<RoleResponse>>): Promise<void> {
    try {
      const { permissionIds } = req.body;
      if (!permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ success: false, message: 'permissionIds debe ser un array' });
        return;
      }
      const role = await roleService.addPermissions(req.params.id, permissionIds) as IRoleDocument;
      const response: RoleResponse = {
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      res.status(200).json({ success: true, data: response, message: 'Permisos agregados correctamente' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al agregar permisos';
      const status = message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  async removePermissions(req: AuthenticatedRequest, res: Response<ApiResponse<RoleResponse>>): Promise<void> {
    try {
      const { permissionIds } = req.body;
      if (!permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ success: false, message: 'permissionIds debe ser un array' });
        return;
      }
      const role = await roleService.removePermissions(req.params.id, permissionIds) as IRoleDocument;
      const response: RoleResponse = {
        _id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      res.status(200).json({ success: true, data: response, message: 'Permisos eliminados correctamente' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar permisos';
      const status = message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }
}

export const roleController = new RoleController();