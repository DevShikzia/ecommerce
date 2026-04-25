/**
 * Configuración base de la aplicación Express
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { generatePermissionsFromRoutes } from './utils/route-scanner';

import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';

export const createApp = async (): Promise<Application> => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'API funcionando correctamente' });
  });

  app.use('/api/v1/roles', roleRoutes);
  app.use('/api/v1/permissions', permissionRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  await generatePermissionsFromRoutes(app);

  return app;
};