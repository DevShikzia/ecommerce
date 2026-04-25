/**
 * Rutas de dashboard
 * Endpoints para estadísticas del panel de administración
 */
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);

router.get('/stats', (req: Request, res: Response) => dashboardController.getStats(req, res));
router.get('/sales-chart', (req: Request, res: Response) => dashboardController.getSalesChart(req, res));
router.get('/category-sales', (req: Request, res: Response) => dashboardController.getCategorySales(req, res));
router.get('/orders', (req: Request, res: Response) => dashboardController.getRecentOrders(req, res));

export default router;