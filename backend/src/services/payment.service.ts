/**
 * Servicio de pagos
 * Maneja la lógica de negocio para pagos con MercadoPago, efectivo y transferencia
 */
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Order, OrderStatus } from '../models/order.model';
import { getConfiguracion, IConfiguracionDocument } from '../models/configuracion.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const client = new MercadoPagoConfig({
  accessToken: env.MERCADO_PAGO_ACCESS_TOKEN,
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

export interface PreferenceResponse {
  preferenceId: string;
  initPoint: string;
}

export interface PaymentResult {
  orderId: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
}

export interface DiscountResult {
  orderId: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  discountCode?: string;
}

export interface DiscountConfig {
  enabled: boolean;
  rules: DiscountRule[];
  codes: DiscountCode[];
}

export interface DiscountRule {
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  active: boolean;
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
}

const getConfig = async (): Promise<IConfiguracionDocument | null> => {
  return getConfiguracion();
};

export const createPreference = async (
  orderId: string,
  userId: string
): Promise<PreferenceResponse> => {
  const order = await Order.findById(orderId).populate('items.product', 'name price images') as any;
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  if (order.user.toString() !== userId) {
    throw new Error('No autorizado para acceder a esta orden');
  }

  const preferenceItems = order.items.map((item: any, index: number) => ({
    id: String(item._id || item.product?._id || index),
    title: item.productName,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: 'ARS',
  }));

  const itemsTotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = order.totalPrice - itemsTotal;
  if (shippingCost > 0) {
    preferenceItems.push({
      id: 'shipping-cost',
      title: 'Costo de envío',
      quantity: 1,
      unit_price: shippingCost,
      currency_id: 'ARS',
    });
  }

  const preference = await preferenceClient.create({
    body: {
      items: preferenceItems,
      external_reference: orderId,
      notification_url: `${env.API_URL}/api/v1/payments/webhook/mercadopago`,
      back_urls: {
        success: `${env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
        failure: `${env.FRONTEND_URL}/checkout/failure?orderId=${orderId}`,
        pending: `${env.FRONTEND_URL}/checkout/pending?orderId=${orderId}`,
      },
    },
  });

  await Order.findByIdAndUpdate(orderId, {
    'paymentInfo.details': { preferenceId: preference.id },
  });

  logger.info(`Preferencia de pago MercadoPago creada para orden ${orderId}`);

  return {
    preferenceId: preference.id || '',
    initPoint: preference.init_point || '',
  };
};

export const processCashPayment = async (
  orderId: string,
  userId: string,
  amount?: number
): Promise<PaymentResult> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  if (order.user.toString() !== userId) {
    throw new Error('No autorizado para acceder a esta orden');
  }

  if (amount && amount < order.totalPrice) {
    throw new Error('El monto abonado es insuficiente');
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: OrderStatus.PROCESSING,
      'paymentInfo.status': 'pending',
      'paymentInfo.method': 'cash',
      'paymentInfo.details': { paymentType: 'cash', amount: amount || order.totalPrice },
    },
    { new: true }
  );

  logger.info(`Pago en efectivo registrado para orden ${orderId}`);

  return {
    orderId: updatedOrder!._id.toString(),
    status: OrderStatus.PROCESSING,
    paymentMethod: 'cash',
  };
};

export const processTransferPayment = async (
  orderId: string,
  userId: string,
  transferProof?: string
): Promise<PaymentResult> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  if (order.user.toString() !== userId) {
    throw new Error('No autorizado para acceder a esta orden');
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: OrderStatus.PENDING,
      'paymentInfo.status': 'pending',
      'paymentInfo.method': 'transfer',
      'paymentInfo.details': { paymentType: 'transfer', transferProof: transferProof || '' },
    },
    { new: true }
  );

  logger.info(`Pago por transferencia registrado para orden ${orderId}, pendiente de confirmación`);

  return {
    orderId: updatedOrder!._id.toString(),
    status: OrderStatus.PENDING,
    paymentMethod: 'transfer',
  };
};

export const applyDiscount = async (
  orderId: string,
  discountCode?: string
): Promise<DiscountResult> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  const config = await getConfig();
  const discountConfig = config?.descuentos;

  if (!discountConfig || !discountConfig.enabled) {
    throw new Error('Descuentos no disponibles');
  }

  let discountAmount = 0;
  let appliedCode = discountCode;

  if (discountCode && discountConfig.codes && discountConfig.codes.length > 0) {
    const codeConfig = discountConfig.codes.find(
      (c: DiscountCode) => c.code.toLowerCase() === discountCode.toLowerCase()
    );

    if (!codeConfig) {
      throw new Error('Código de descuento inválido');
    }

    if (!codeConfig.active) {
      throw new Error('Código de descuento desactivado');
    }

    if (codeConfig.maxUses && codeConfig.usedCount >= codeConfig.maxUses) {
      throw new Error('Código de descuento agotado');
    }

    if (codeConfig.type === 'percentage') {
      discountAmount = (order.totalPrice * codeConfig.value) / 100;
      if (discountConfig.rules && discountConfig.rules[0]?.maxDiscount) {
        discountAmount = Math.min(discountAmount, discountConfig.rules[0].maxDiscount);
      }
    } else if (codeConfig.type === 'fixed') {
      discountAmount = codeConfig.value;
    }

    await Order.findByIdAndUpdate(orderId, {
      'paymentInfo.details': {
        ...order.paymentInfo.details,
        discountCode,
        discountAmount,
      },
    });
  } else if (discountConfig.rules && discountConfig.rules.length > 0) {
    const rule = discountConfig.rules.find((r: DiscountRule) => r.active);
    if (rule) {
      if (rule.minPurchase && order.totalPrice < rule.minPurchase) {
        throw new Error(`Compra mínima de ${rule.minPurchase} para aplicar descuento`);
      }

      if (rule.type === 'percentage') {
        discountAmount = (order.totalPrice * rule.value) / 100;
        if (rule.maxDiscount) {
          discountAmount = Math.min(discountAmount, rule.maxDiscount);
        }
      } else if (rule.type === 'fixed') {
        discountAmount = rule.value;
      }
    }
  }

  const finalTotal = Math.max(0, order.totalPrice - discountAmount);

  return {
    orderId: order._id.toString(),
    originalTotal: order.totalPrice,
    discountAmount,
    finalTotal,
    discountCode: appliedCode,
  };
};

export const getDiscountConfig = async (): Promise<DiscountConfig> => {
  const config = await getConfig();
  const discountConfig = config?.descuentos;

  if (!discountConfig) {
    return {
      enabled: false,
      rules: [],
      codes: [],
    };
  }

  return {
    enabled: discountConfig.enabled || false,
    rules: discountConfig.rules || [],
    codes: discountConfig.codes || [],
  };
};

export const handleMercadoPagoWebhook = async (
  paymentId: string
): Promise<void> => {
  try {
    const payment = await paymentClient.get({ id: Number(paymentId) });
    if (!payment) {
      logger.error(`Pago MercadoPago ${paymentId} no encontrado`);
      return;
    }

    const orderId = payment.external_reference;
    const status = payment.status;

    if (!orderId) {
      logger.error('No se encontró external_reference en el pago');
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
      'paymentInfo.transactionId': paymentId,
      status: newStatus,
    });

    logger.info(`Orden ${orderId} actualizada con status ${status} desde webhook MercadoPago`);
  } catch (error) {
    logger.error('Error al procesar webhook de MercadoPago:', error);
    throw error;
  }
};