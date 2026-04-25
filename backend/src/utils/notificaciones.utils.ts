/**
 * Utilidades de notificaciones
 * Maneja el envío de emails usando Resend
 */
import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const resend = new Resend(env.RESEND_API_KEY);

const getEmailFromConfig = async (): Promise<string> => {
  try {
    const { getConfiguracion } = await import('../models/configuracion.model');
    const configuracion = await getConfiguracion();
    return configuracion?.nombreEcommerce || 'noreply@mitienda.com';
  } catch {
    return 'noreply@mitienda.com';
  }
};

const getStoreName = async (): Promise<string> => {
  try {
    const { getConfiguracion } = await import('../models/configuracion.model');
    const configuracion = await getConfiguracion();
    return configuracion?.nombreEcommerce || 'Mi Tienda';
  } catch {
    return 'Mi Tienda';
  }
};

export interface OrderStatusEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  newStatus: string;
  items: { productName: string; quantity: number; price: number }[];
}

const getStatusEmailSubject = (status: string, orderId: string): string => {
  const subjects: Record<string, string> = {
    pending: `Tu pedido #${orderId} está siendo procesado`,
    processing: `Pago confirmado - Pedido #${orderId}`,
    shipped: `Tu pedido #${orderId} ha sido enviado`,
    delivered: `Tu pedido #${orderId} ha sido entregado`,
    cancelled: `Tu pedido #${orderId} ha sido cancelado`,
  };
  return subjects[status] || `Actualización de tu pedido #${orderId}`;
};

const getStatusEmailHtml = (data: OrderStatusEmailData, storeName: string): string => {
  const statusMessages: Record<string, string> = {
    pending: 'Tu pedido está siendo procesado y awaiting confirmación de pago.',
    processing: '¡Excelentes noticias! Hemos confirmado tu pago y estamos preparando tu pedido.',
    shipped: 'Tu pedido ha sido enviado y está en camino. ¡Pronto lo tendrás!',
    delivered: 'Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!',
    cancelled: 'Tu pedido ha sido cancelado. Si tienes alguna pregunta, contáctanos.',
  };

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('es-AR')}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">${storeName}</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Hola ${data.customerName},</h2>
        <p style="color: #666; font-size: 16px;">${statusMessages[data.newStatus] || 'Hay una actualización en tu pedido.'}</p>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Número de pedido:</strong> #${data.orderId}</p>
          <p style="margin: 10px 0 0;"><strong>Total:</strong> $${data.orderTotal.toLocaleString('es-AR')}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Producto</th>
              <th style="padding: 10px; text-align: center;">Cantidad</th>
              <th style="padding: 10px; text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right;"><strong>$${data.orderTotal.toLocaleString('es-AR')}</strong></td>
            </tr>
          </tfoot>
        </table>

        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
        </p>
      </div>
    </div>
  `;
};

export const sendOrderStatusNotification = async (data: OrderStatusEmailData): Promise<void> => {
  try {
    const [fromEmail, storeName] = await Promise.all([getEmailFromConfig(), getStoreName()]);

    const { error } = await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: data.customerEmail,
      subject: getStatusEmailSubject(data.newStatus, data.orderId),
      html: getStatusEmailHtml(data, storeName),
    });

    if (error) {
      logger.error('Error al enviar email de notificación de orden:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    logger.info(`Email de estado de orden enviado a ${data.customerEmail} para orden ${data.orderId}`);
  } catch (error) {
    logger.error('Error en sendOrderStatusNotification:', error);
  }
};

export interface WelcomeEmailData {
  email: string;
  name: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<void> => {
  try {
    const [fromEmail, storeName] = await Promise.all([getEmailFromConfig(), getStoreName()]);

    const { error } = await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: data.email,
      subject: `¡Bienvenido a ${storeName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${storeName}</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #333;">¡Bienvenido, ${data.name}!</h2>
            <p style="color: #666; font-size: 16px;">
              Gracias por registrarte en ${storeName}. Estamos encantados de tenerte con nosotros.
            </p>
            <p style="color: #666; font-size: 16px;">
              Ahora puedes explorar nuestro catálogo y realizar tus compras.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      logger.error('Error al enviar email de bienvenida:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    logger.info(`Email de bienvenida enviado a ${data.email}`);
  } catch (error) {
    logger.error('Error en sendWelcomeEmail:', error);
  }
};