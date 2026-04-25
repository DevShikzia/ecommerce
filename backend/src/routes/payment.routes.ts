/**
 * Rutas de pagos
 * Endpoints para MercadoPago, efectivo y transferencia
 */
import { Router } from 'express';
import {
  createMercadoPagoPreference,
  processCashPayment,
  processTransferPayment,
  applyDiscount,
  getDiscountConfiguration,
  webhookMercadoPago,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/mercadopago', authMiddleware, createMercadoPagoPreference);
router.post('/cash', authMiddleware, processCashPayment);
router.post('/transfer', authMiddleware, processTransferPayment);
router.post('/webhook/mercadopago', webhookMercadoPago);
router.post('/discount', authMiddleware, applyDiscount);
router.get('/discount', getDiscountConfiguration);

export default router;