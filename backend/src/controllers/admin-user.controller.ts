/**
 * Controlador de administración de usuarios
 * Maneja endpoints para gestión de usuarios por administradores
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api-response';
import {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllRoles,
  AdminUserUpdateData,
  UserListQuery,
  UserListResult,
  UserListItem,
} from '../services/admin-user.service';

/**
 * Obtiene la lista de usuarios con paginación y filtros
 */
export const listUsers = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserListResult>>
): Promise<void> => {
  try {
    const query: UserListQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      role: req.query.role as string,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string,
    };

    const result = await getUsers(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al obtener usuarios',
    });
  }
};

/**
 * Obtiene un usuario por su ID
 */
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserListItem | null>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al obtener usuario',
    });
  }
};

/**
 * Actualiza un usuario (datos, rol, verificación)
 */
export const adminUpdateUser = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserListItem | null>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: AdminUserUpdateData = req.body;

    const user = await updateUser(id, updateData);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Usuario actualizado correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
    if (message.includes('ya está en uso') || message.includes('Rol no encontrado')) {
      res.status(400).json({ success: false, message });
      return;
    }
    res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * Activa o desactiva un usuario
 */
export const setUserStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<boolean>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const isActive = await toggleUserStatus(id);

    res.status(200).json({
      success: true,
      data: isActive,
      message: isActive ? 'Usuario activado' : 'Usuario desactivado',
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al cambiar estado del usuario',
    });
  }
};

/**
 * Elimina un usuario (soft delete)
 */
export const adminDeleteUser = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<boolean>>
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteUser(id);

    res.status(200).json({
      success: true,
      data: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar usuario',
    });
  }
};

/**
 * Obtiene todos los roles disponibles
 */
export const listRoles = async (
  _req: AuthenticatedRequest,
  res: Response<ApiResponse<{ id: string; name: string }[]>>
): Promise<void> => {
  try {
    const roles = await getAllRoles();

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al obtener roles',
    });
  }
};