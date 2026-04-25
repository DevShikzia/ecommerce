/**
 * Controlador de pagos
 * Maneja los endpoints de pago: MercadoPago, efectivo y transferencia
 */
import { Request, Response } from 'express';
import {
  createPreference as createPreferenceService,
  processCashPayment as processCashPaymentService,
  processTransferPayment as processTransferPaymentService,
  applyDiscount as applyDiscountService,
  getDiscountConfig as getDiscountConfigService,
  handleMercadoPagoWebhook as handleMercadoPagoWebhookService,
} from '../services/payment.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const createMercadoPagoPreference = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'ID de orden requerido',
      });
      return;
    }

    const preference = await createPreferenceService(orderId, userId);

    res.status(200).json({
      success: true,
      data: preference,
    });
  } catch (error: any) {
    logger.error('Error en createMercadoPagoPreference:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear preferencia de pago',
    });
  }
};

export const processCashPayment = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { orderId, amount } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'ID de orden requerido',
      });
      return;
    }

    const result = await processCashPaymentService(orderId, userId, amount);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Pago en efectivo registrado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en processCashPayment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar pago en efectivo',
    });
  }
};

export const processTransferPayment = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { orderId, transferProof } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'ID de orden requerido',
      });
      return;
    }

    const result = await processTransferPaymentService(orderId, userId, transferProof);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Pago por transferencia registrado, pendiente de confirmación',
    });
  } catch (error: any) {
    logger.error('Error en processTransferPayment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar pago por transferencia',
    });
  }
};

export const applyDiscount = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { orderId, discountCode } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'ID de orden requerido',
      });
      return;
    }

    const result = await applyDiscountService(orderId, discountCode);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Descuento aplicado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en applyDiscount:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al aplicar descuento',
    });
  }
};

export const getDiscountConfiguration = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const config = await getDiscountConfigService();

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    logger.error('Error en getDiscountConfiguration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener configuración de descuentos',
    });
  }
};

export const webhookMercadoPago = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { topic, id } = req.query;

    logger.info(`Webhook MercadoPago recibido - topic: ${topic}, id: ${id}`);

    if (topic === 'payment' && id) {
      await handleMercadoPagoWebhookService(id as string);
    }

    res.status(200).json({ success: true, message: 'Webhook procesado' });
  } catch (error: any) {
    logger.error('Error en webhookMercadoPago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar webhook',
    });
  }
};