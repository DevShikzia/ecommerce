/**
 * Configuración base de la aplicación Express
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { generatePermissionsFromRoutes } from './utils/route-scanner';

import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import configuracionRoutes from './routes/configuracion.routes';
import userRoutes from './routes/user.routes';
import adminUserRoutes from './routes/admin-user.routes';

export const createApp = async (): Promise<Application> => {
  const app = express();

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'API funcionando correctamente' });
  });

  app.use('/api/v1/roles', roleRoutes);
  app.use('/api/v1/permissions', permissionRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/config', configuracionRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/admin/users', adminUserRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  await generatePermissionsFromRoutes(app);

  return app;
};