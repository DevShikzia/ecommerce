/**
 * Servicio de configuración
 * Maneja la lógica de negocio para la configuración del e-commerce
 */
import { v2 as cloudinary } from 'cloudinary';
import {
  IConfiguracion,
  IConfiguracionDocument,
  getConfiguracion,
  updateConfiguracion,
  getOrCreateConfiguracion,
} from '../models/configuracion.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const getPublicConfig = async (): Promise<Partial<IConfiguracionDocument>> => {
  const config = await getConfiguracion();
  if (!config) {
    return {
      nombreEcommerce: 'Mi Tienda',
      logo: '',
      colores: { primary: '#000000', secondary: '#666666', background: '#FFFFFF', text: '#333333' },
      moneda: 'ARS',
    };
  }
  return config;
};

export const getFullConfig = async (): Promise<IConfiguracionDocument | null> => {
  return getConfiguracion();
};

export const updateConfig = async (
  data: Partial<IConfiguracion>
): Promise<IConfiguracionDocument> => {
  const config = await updateConfiguracion(data);
  logger.info('Configuración actualizada');
  return config;
};

export const uploadLogoToCloudinary = async (
  logoData: string
): Promise<string> => {
  if (!logoData.startsWith('data:')) {
    return logoData;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      logoData,
      {
        folder: 'ecommerce/config',
        transformation: [
          { width: 300, height: 300, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir logo a Cloudinary:', error);
          reject(new Error('Error al subir logo'));
        } else {
          resolve(result!.secure_url);
        }
      }
    );
  });
};

export const initializeConfig = async (): Promise<IConfiguracionDocument> => {
  return getOrCreateConfiguracion();
};