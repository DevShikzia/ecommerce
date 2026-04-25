/**
 * Rutas de configuración
 * Endpoints para gestionar la configuración del e-commerce
 */
import { Router } from 'express';
import {
  getConfiguracionHandler,
  updateConfiguracionHandler,
} from '../controllers/configuracion.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permisos.middleware';

const router = Router();

router.get('/', getConfiguracionHandler);

router.put('/', authMiddleware, checkPermission, updateConfiguracionHandler);

export default router;