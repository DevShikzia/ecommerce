/**
 * Controlador de órdenes
 * Maneja los endpoints de órdenes y checkout
 */
import { Request, Response } from 'express';
import {
  createOrder as createOrderService,
  getOrderById as getOrderByIdService,
  getOrdersByUserId as getOrdersByUserIdService,
  updateOrderStatus as updateOrderStatusService,
  getAllOrders as getAllOrdersService,
  createMercadoPagoPreference as createMercadoPagoPreferenceService,
  getPaymentMethods as getPaymentMethodsService,
} from '../services/order.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const createOrder = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const {
      shippingAddress,
      paymentMethod,
      paymentMethodType = 'mercadopago',
    } = req.body;

    if (!shippingAddress || !paymentMethod) {
      res.status(400).json({
        success: false,
        message: 'Dirección de envío y método de pago requeridos',
      });
      return;
    }

    const order = await createOrderService({
      userId,
      shippingAddress,
      paymentMethod,
      paymentMethodType,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Orden creada correctamente',
    });
  } catch (error: any) {
    logger.error('Error en createOrder:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la orden',
    });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { id } = req.params;

    const order = await getOrderByIdService(id, userId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    logger.error('Error en getOrderById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener la orden',
    });
  }
};

export const getOrders = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await getOrdersByUserIdService(
      userId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Error en getOrders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las órdenes',
    });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const adminUserId = authenticatedReq.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Estado requerido',
      });
      return;
    }

    const order = await updateOrderStatusService(id, adminUserId, status);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Estado de la orden actualizado',
    });
  } catch (error: any) {
    logger.error('Error en updateOrderStatus:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar el estado',
    });
  }
};

export const getOrdersAdmin = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await getAllOrdersService(
      Number(page),
      Number(limit),
      status as any
    );

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Error en getOrdersAdmin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las órdenes',
    });
  }
};

export const createPaymentPreference = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const preference = await createMercadoPagoPreferenceService(orderId);

    res.status(200).json({
      success: true,
      data: preference,
    });
  } catch (error: any) {
    logger.error('Error en createPaymentPreference:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la preferencia de pago',
    });
  }
};

export const getPaymentMethodsHandler = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const result = await getPaymentMethodsService();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error en getPaymentMethodsHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los métodos de pago',
    });
  }
};