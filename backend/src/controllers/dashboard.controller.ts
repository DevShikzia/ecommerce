/**
 * Controlador de dashboard
 * Proporciona estadísticas para el panel de administración
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';
import { Order, OrderStatus } from '../models/order.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

export interface DashboardStats {
  ventasMes: number;
  ventasMesAnterior: number;
  pedidosPendientes: number;
  pedidosMesAnterior: number;
  usuariosNuevos: number;
  usuariosSemana: number;
  productosActivos: number;
  productosStockBajo: number;
}

export interface SalesChartData {
  labels: string[];
  values: number[];
}

export interface CategorySalesData {
  category: string;
  total: number;
}

interface OrderUser {
  name?: string;
  email?: string;
}

interface OrderDoc {
  _id: unknown;
  user: OrderUser | null;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
}

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [thisMonthOrders, lastMonthOrders, pendingOrders, newUsers, activeProducts, lowStockProducts] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        Order.countDocuments({ status: OrderStatus.PENDING }),
        User.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ stock: { $lt: 10 }, isActive: true })
      ]);

      const stats: DashboardStats = {
        ventasMes: thisMonthOrders[0]?.total || 0,
        ventasMesAnterior: lastMonthOrders[0]?.total || 0,
        pedidosPendientes: pendingOrders,
        pedidosMesAnterior: 0,
        usuariosNuevos: newUsers,
        usuariosSemana: newUsers,
        productosActivos: activeProducts,
        productosStockBajo: lowStockProducts
      };

      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error en getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del dashboard'
      });
    }
  }

  async getSalesChart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const labels: string[] = [];
      const values: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const dayOrders = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalPrice' }
            }
          }
        ]);

        labels.push(startOfDay.toLocaleDateString('es-AR', { weekday: 'short' }));
        values.push(dayOrders[0]?.total || 0);
      }

      res.status(200).json({ success: true, data: { labels, values } });
    } catch (error) {
      logger.error('Error en getSalesChart:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos del gráfico'
      });
    }
  }

  async getCategorySales(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sales = await Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' },
        {
          $group: {
            _id: '$productInfo.category',
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]);

      const data: CategorySalesData[] = sales.map(s => ({
        category: s._id as string,
        total: s.total
      }));

      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Error en getCategorySales:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventas por categoría'
      });
    }
  }

  async getRecentOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean();

      const formattedOrders = orders.map(order => {
        const orderDoc = order as unknown as OrderDoc;
        return {
          _id: order._id,
          usuario: {
            nombre: orderDoc.user?.name || 'Usuario',
            email: orderDoc.user?.email || ''
          },
          precioTotal: orderDoc.totalPrice,
          estado: orderDoc.status,
          fecha: orderDoc.createdAt
        };
      });

      res.status(200).json({ success: true, data: formattedOrders });
    } catch (error) {
      logger.error('Error en getRecentOrders:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pedidos recientes'
      });
    }
  }
}

export const dashboardController = new DashboardController();