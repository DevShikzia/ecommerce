/**
 * Rutas de órdenes
 * Endpoints para gestión de órdenes y checkout
 */
import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrdersAdmin,
  createPaymentPreference,
  getPaymentMethodsHandler,
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permisos.middleware';

const router = Router();

router.get('/payment-methods', getPaymentMethodsHandler);

router.post('/preference', authMiddleware, createPaymentPreference);

router.get('/admin', authMiddleware, checkPermission, getOrdersAdmin);

router.put('/:id/status', authMiddleware, checkPermission, updateOrderStatus);

router.get('/', authMiddleware, getOrders);

router.get('/:id', authMiddleware, getOrderById);

router.post('/', authMiddleware, createOrder);

export default router;