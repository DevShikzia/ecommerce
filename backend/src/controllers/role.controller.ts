/**
 * Controlador de roles
 * Gestiona las operaciones CRUD de roles
 */
import { Response } from 'express';
import { roleService } from '../services/role.service';
import { ApiResponse } from '../types/api-response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class RoleController {
  async getRoles(_req: AuthenticatedRequest, res: Response<ApiResponse<any[]>>): Promise<void> {
    try {
      const roles = await roleService.findAll();
      res.status(200).json({ success: true, data: roles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoleById(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const role = await roleService.findById(req.params.id);
      res.status(200).json({ success: true, data: role });
    } catch (error: any) {
      const status = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async createRole(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { name, permissions, description } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'El nombre del rol es requerido' });
        return;
      }
      const role = await roleService.create({ name, permissions, description });
      res.status(201).json({ success: true, data: role, message: 'Rol creado correctamente' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateRole(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { name, permissions, description } = req.body;
      const role = await roleService.update(req.params.id, { name, permissions, description });
      res.status(200).json({ success: true, data: role, message: 'Rol actualizado correctamente' });
    } catch (error: any) {
      const status = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async deleteRole(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const role = await roleService.findById(req.params.id);
      if (role.name === 'admin') {
        res.status(403).json({ success: false, message: 'No se puede eliminar el rol admin' });
        return;
      }
      await roleService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error: any) {
      const status = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async addPermissions(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { permissionIds } = req.body;
      if (!permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ success: false, message: 'permissionIds debe ser un array' });
        return;
      }
      const role = await roleService.addPermissions(req.params.id, permissionIds);
      res.status(200).json({ success: true, data: role, message: 'Permisos agregados correctamente' });
    } catch (error: any) {
      const status = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async removePermissions(req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { permissionIds } = req.body;
      if (!permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ success: false, message: 'permissionIds debe ser un array' });
        return;
      }
      const role = await roleService.removePermissions(req.params.id, permissionIds);
      res.status(200).json({ success: true, data: role, message: 'Permisos eliminados correctamente' });
    } catch (error: any) {
      const status = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}

export const roleController = new RoleController();