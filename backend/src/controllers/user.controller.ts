/**
 * Controlador de usuario
 * Maneja endpoints para gestión de perfil propio del usuario autenticado
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api-response';
import {
  getProfile,
  updateProfile,
  changePassword,
  ProfileUpdateData,
  ChangePasswordData,
  UserProfile,
} from '../services/user.service';

/**
 * Obtiene el perfil del usuario autenticado
 */
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfile>>
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al obtener perfil',
    });
  }
};

/**
 * Actualiza el perfil del usuario autenticado
 */
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfile>>
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updateData: ProfileUpdateData = req.body;

    const profile = await updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Perfil actualizado correctamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al actualizar perfil',
    });
  }
};

/**
 * Cambia la contraseña del usuario autenticado
 */
export const userChangePassword = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<boolean>>
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const passwordData: ChangePasswordData = req.body;

    await changePassword(userId, passwordData);

    res.status(200).json({
      success: true,
      data: true,
      message: 'Contraseña cambiada correctamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al cambiar contraseña',
    });
  }
};