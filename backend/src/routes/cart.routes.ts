/**
 * Rutas de carrito
 * Endpoints para gestión del carrito de compras
 */
import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  migrateLocalCart,
} from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getCart);

router.post('/add', authMiddleware, addToCart);

router.put('/item', authMiddleware, updateCartItem);

router.delete('/item/:productId', authMiddleware, removeFromCart);

router.delete('/clear', authMiddleware, clearCart);

router.post('/migrate', authMiddleware, migrateLocalCart);

export default router;