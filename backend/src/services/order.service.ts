/**
 * Servicio de órdenes
 * Maneja la lógica de negocio para órdenes y pagos con MercadoPago
 */
import { Order, OrderStatus } from '../models/order.model';
import { getConfiguracion } from '../models/configuracion.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';

interface MercadoPagoResponse {
  id: string;
  init_point?: string;
}

const mercadopagoFetch = async (endpoint: string, body?: unknown): Promise<MercadoPagoResponse> => {
  const response = await globalThis.fetch(`${MERCADO_PAGO_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`MercadoPago API error: ${response.status}`);
  }

  return response.json() as Promise<MercadoPagoResponse>;
};

export interface CreateOrderData {
  userId: string;
  shippingAddress: {
    street: string;
    number: string;
    floor?: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  paymentMethodType: 'mercadopago' | 'cash' | 'transfer';
}

export interface MercadoPagoPreferenceResponse {
  preferenceId: string;
  initPoint: string;
}

export const createMercadoPagoPreference = async (
  orderId: string
): Promise<MercadoPagoPreferenceResponse> => {
  const order = await Order.findById(orderId).populate('items.product', 'name price');
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  const preferenceItems = order.items.map((item) => ({
    title: item.productName,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: 'ARS',
  }));

  const shippingCost = order.totalPrice - order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (shippingCost > 0) {
    preferenceItems.push({
      title: 'Costo de envío',
      quantity: 1,
      unit_price: shippingCost,
      currency_id: 'ARS',
    });
  }

  const response = await mercadopagoFetch('/checkout/preferences', {
    items: preferenceItems,
    external_reference: orderId,
    notification_url: `${env.FRONTEND_URL}/api/v1/orders/webhook`,
    back_urls: {
      success: `${env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
      failure: `${env.FRONTEND_URL}/checkout/failure?orderId=${orderId}`,
      pending: `${env.FRONTEND_URL}/checkout/pending?orderId=${orderId}`,
    },
  });

  const initPoint = response.init_point;

  await Order.findByIdAndUpdate(orderId, {
    'paymentInfo.details': { preferenceId: response.id },
  });

  logger.info(`Preferencia de pago creada para orden ${orderId}`);

  return {
    preferenceId: response.id,
    initPoint: initPoint || '',
  };
};

export const getPaymentMethods = async (): Promise<{
  paymentMethods: { id: string; name: string; type: string; enabled: boolean; instructions?: string }[];
  shippingConfig: { freeShippingMinAmount: number; fixedShippingCost: number; enabled: boolean };
}> => {
  const configuracion = await getConfiguracion();

  return {
    paymentMethods: (configuracion?.metodosPago || []).filter(
      (pm) => pm.habilitado
    ).map((pm) => ({
      id: pm.nombre.toLowerCase().replace(/\s+/g, ''),
      name: pm.nombre,
      type: pm.nombre.toLowerCase().replace(/\s+/g, ''),
      enabled: pm.habilitado,
      instructions: pm.config?.instrucciones as string | undefined,
    })),
    shippingConfig: configuracion?.reglasEnvio ? {
      freeShippingMinAmount: configuracion.reglasEnvio.montoMinimoGratis,
      fixedShippingCost: configuracion.reglasEnvio.costoFijo,
      enabled: configuracion.reglasEnvio.habilitado,
    } : {
      freeShippingMinAmount: 15000,
      fixedShippingCost: 500,
      enabled: true,
    },
  };
};

export const handleMercadoPagoWebhook = async (
  orderId: string,
  status: string,
  paymentId?: string
): Promise<void> => {
  if (!orderId) {
    logger.error('No se encontró orderId en el webhook');
    return;
  }

  let newStatus: OrderStatus;
  switch (status) {
    case 'approved':
      newStatus = OrderStatus.PROCESSING;
      break;
    case 'rejected':
    case 'cancelled':
      newStatus = OrderStatus.CANCELLED;
      break;
    case 'pending':
    case 'in_process':
    default:
      newStatus = OrderStatus.PENDING;
      break;
  }

  await Order.findByIdAndUpdate(orderId, {
    'paymentInfo.status': status,
    'paymentInfo.transactionId': paymentId || '',
    status: newStatus,
  });

  logger.info(`Orden ${orderId} actualizada con status ${status} desde webhook`);
};