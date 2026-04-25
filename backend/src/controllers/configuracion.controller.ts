/**
 * Controlador de configuración
 * Maneja los endpoints de configuración del e-commerce
 */
import { Request, Response } from 'express';
import {
  getPublicConfig,
  getFullConfig,
  updateConfig,
  uploadLogoToCloudinary,
} from '../services/config.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const getConfig = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const config = await getPublicConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error('Error en getConfig:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener la configuración',
    });
  }
};

export const getFullConfigHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const config = await getFullConfig();
    if (!config) {
      res.status(404).json({
        success: false,
        message: 'Configuración no encontrada',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error('Error en getFullConfigHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener la configuración completa',
    });
  }
};

export const updateConfigHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const {
      nombreEcommerce,
      logo,
      colores,
      metodosPago,
      reglasEnvio,
      moneda,
    } = req.body;

    let logoUrl = logo;
    if (logo && logo.startsWith('data:')) {
      logoUrl = await uploadLogoToCloudinary(logo);
    }

    const config = await updateConfig({
      nombreEcommerce,
      logo: logoUrl,
      colores,
      metodosPago,
      reglasEnvio,
      moneda,
    });

    res.status(200).json({
      success: true,
      data: config,
      message: 'Configuración actualizada correctamente',
    });
  } catch (error: any) {
    logger.error('Error en updateConfigHandler:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la configuración',
    });
  }
};