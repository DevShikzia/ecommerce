/**
 * Controlador de configuración
 * Maneja los endpoints de configuración del e-commerce
 */
import { Request, Response } from 'express';
import {
  getConfiguracion,
  updateConfiguracion,
} from '../models/configuracion.model';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const getConfiguracionHandler = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const config = await getConfiguracion();

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error('Error en getConfiguracionHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener la configuración',
    });
  }
};

export const updateConfiguracionHandler = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const {
      storeName,
      storeLogo,
      storeEmail,
      storePhone,
      paymentMethods,
      shippingConfig,
    } = req.body;

    const config = await updateConfiguracion({
      storeName,
      storeLogo,
      storeEmail,
      storePhone,
      paymentMethods,
      shippingConfig,
    });

    res.status(200).json({
      success: true,
      data: config,
      message: 'Configuración actualizada correctamente',
    });
  } catch (error: any) {
    logger.error('Error en updateConfiguracionHandler:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la configuración',
    });
  }
};