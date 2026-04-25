/**
 * Rutas de roles
 * Endpoints para gestión de roles (protegidos por middleware de permisos)
 */
import { Router, Response } from 'express';
import { roleService } from '../services/role.service';
import { checkPermission } from '../middleware/permisos.middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api-response';

const router = Router();

router.use(authMiddleware);
router.use(checkPermission);

router.get('/', async (req: AuthenticatedRequest, res: Response<ApiResponse<any[]>>) => {
  try {
    const roles = await roleService.findAll();
    res.status(200).json({ success: true, data: roles });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    const role = await roleService.findById(req.params.id);
    res.status(200).json({ success: true, data: role });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await roleService.create({ name, permissions, description });
    res.status(201).json({ success: true, data: role, message: 'Rol creado correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await roleService.update(req.params.id, { name, permissions, description });
    res.status(200).json({ success: true, data: role, message: 'Rol actualizado correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    await roleService.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Rol eliminado correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/permissions', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { permissionIds } = req.body;
    const role = await roleService.addPermissions(req.params.id, permissionIds);
    res.status(200).json({ success: true, data: role, message: 'Permisos agregados correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id/permissions', async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  try {
    const { permissionIds } = req.body;
    const role = await roleService.removePermissions(req.params.id, permissionIds);
    res.status(200).json({ success: true, data: role, message: 'Permisos eliminados correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;