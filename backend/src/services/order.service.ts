/**
 * Servicio de órdenes
 * Maneja la lógica de negocio para órdenes y pagos con MercadoPago
 */
import { Order, IOrderDocument, IOrder, OrderStatus } from '../models/order.model';
import { Cart, ICartDocument } from '../models/cart.model';
import { Product, IProductDocument } from '../models/product.model';
import { getConfiguracion, IShippingConfig } from '../models/configuracion.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';

const mercadopagoFetch = async (endpoint: string, body?: unknown): Promise<unknown> => {
  const response = await fetch(`${MERCADO_PAGO_API_URL}${endpoint}`, {
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

  return response.json();
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

const reduceStock = async (items: { product: string; quantity: number }[]): Promise<void> => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
};

const calculateShippingCost = (
  totalPrice: number,
  shippingConfig: IShippingConfig
): number => {
  if (!shippingConfig.enabled) {
    return 0;
  }

  if (totalPrice >= shippingConfig.freeShippingMinAmount) {
    return 0;
  }

  return shippingConfig.fixedShippingCost;
};

const calculateOrderTotals = async (
  cart: ICartDocument,
  paymentMethodType: 'mercadopago' | 'cash' | 'transfer'
): Promise<{ subtotal: number; shippingCost: number; total: number }> => {
  const configuracion = await getConfiguracion();
  const shippingConfig = configuracion?.shippingConfig || {
    freeShippingMinAmount: 15000,
    fixedShippingCost: 500,
    enabled: true,
  };

  const subtotal = cart.totalPrice;
  const shippingCost = calculateShippingCost(subtotal, shippingConfig);
  const total = subtotal + shippingCost;

  return { subtotal, shippingCost, total };
};

export const createOrder = async (
  data: CreateOrderData
): Promise<IOrderDocument> => {
  const { userId, shippingAddress, paymentMethod, paymentMethodType } = data;

  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price stock');
  if (!cart || cart.items.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const { subtotal, shippingCost, total } = await calculateOrderTotals(cart, paymentMethodType);

  const orderItems = cart.items.map((item) => ({
    product: (item.product as unknown as IProductDocument)._id,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentInfo: {
      method: paymentMethod,
      status: 'pending',
    },
    totalPrice: total,
    status: OrderStatus.PENDING,
    paymentMethod,
  });

  await reduceStock(
    orderItems.map((item) => ({
      product: item.product.toString(),
      quantity: item.quantity,
    }))
  );

  await Cart.updateOne({ user: userId }, { $set: { items: [], totalPrice: 0 } });

  logger.info(`Orden ${order._id} creada para el usuario ${userId}`);

  return order;
};

export const getOrderById = async (
  orderId: string,
  userId: string
): Promise<IOrderDocument | null> => {
  return Order.findOne({ _id: orderId, user: userId }).populate('items.product', 'name images');
};

export const getOrdersByUserId = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ orders: IOrderDocument[]; total: number }> => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images')
      .lean() as unknown as IOrderDocument[],
    Order.countDocuments({ user: userId }),
  ]);

  return { orders, total };
};

export const updateOrderStatus = async (
  orderId: string,
  adminUserId: string,
  status: OrderStatus
): Promise<IOrderDocument | null> => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (order) {
    logger.info(`Orden ${orderId} actualizada a estado ${status} por admin ${adminUserId}`);
  }

  return order;
};

export const getAllOrders = async (
  page: number = 1,
  limit: number = 20,
  status?: OrderStatus
): Promise<{ orders: IOrderDocument[]; total: number }> => {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .lean() as unknown as IOrderDocument[],
    Order.countDocuments(filter),
  ]);

  return { orders, total };
};

export const createMercadoPagoPreference = async (
  orderId: string
): Promise<MercadoPagoPreferenceResponse> => {
  const order = await Order.findById(orderId).populate('items.product', 'name price');
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  const configuracion = await getConfiguracion();
  const storeName = configuracion?.storeName || 'Mi Tienda';

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
  }) as { id: string; init_point: string };

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
    paymentMethods: (configuracion?.paymentMethods || []).filter(
      (pm) => pm.enabled
    ),
    shippingConfig: configuracion?.shippingConfig || {
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