/**
 * Rutas de configuración
 * Endpoints para gestionar la configuración del e-commerce
 */
import { Router } from 'express';
import {
  getConfig,
  getFullConfigHandler,
  updateConfigHandler,
} from '../controllers/configuracion.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permisos.middleware';

const router = Router();

router.get('/', getConfig);

router.get('/full', authMiddleware, checkPermission, getFullConfigHandler);

router.put('/', authMiddleware, checkPermission, updateConfigHandler);

export default router;