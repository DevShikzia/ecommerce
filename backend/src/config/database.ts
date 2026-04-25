/**
 * Conexión a MongoDB Atlas
 */
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Conectado a MongoDB Atlas');
  } catch (error) {
    logger.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('Desconectado de MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Error de MongoDB:', err);
});