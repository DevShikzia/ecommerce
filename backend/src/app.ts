/**
 * Configuración base de la aplicación Express
 */
import express, { Application } from 'express';
import cors from 'cors';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'API funcionando correctamente' });
  });

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};