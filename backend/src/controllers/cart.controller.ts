/**
 * Controlador de carrito
 * Maneja los endpoints del carrito de compras
 */
import { Request, Response } from 'express';
import {
  getCartByUserId,
  addToCart as addToCartService,
  updateCartItem as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  migrateLocalCartToDb as migrateLocalCartToDbService,
} from '../services/cart.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const getCart = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;

    const cart = await getCartByUserId(userId);

    res.status(200).json({
      success: true,
      data: cart || { items: [], totalPrice: 0 },
    });
  } catch (error: any) {
    logger.error('Error en getCart:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener el carrito',
    });
  }
};

export const addToCart = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'ID del producto requerido',
      });
      return;
    }

    const cart = await addToCartService(userId, { productId, quantity });

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Producto agregado al carrito',
    });
  } catch (error: any) {
    logger.error('Error en addToCart:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al agregar al carrito',
    });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      res.status(400).json({
        success: false,
        message: 'ID del producto y cantidad requeridos',
      });
      return;
    }

    const cart = await updateCartItemService(userId, { productId, quantity });

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Carrito actualizado',
    });
  } catch (error: any) {
    logger.error('Error en updateCartItem:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar el carrito',
    });
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'ID del producto requerido',
      });
      return;
    }

    const cart = await removeFromCartService(userId, productId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Producto eliminado del carrito',
    });
  } catch (error: any) {
    logger.error('Error en removeFromCart:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al eliminar del carrito',
    });
  }
};

export const clearCart = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;

    await clearCartService(userId);

    res.status(200).json({
      success: true,
      message: 'Carrito vaciado',
    });
  } catch (error: any) {
    logger.error('Error en clearCart:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al vaciar el carrito',
    });
  }
};

export const migrateLocalCart = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authenticatedReq = req as any;
    const userId = authenticatedReq.user.id;
    const { localCartItems } = req.body;

    if (!localCartItems || !Array.isArray(localCartItems)) {
      res.status(400).json({
        success: false,
        message: 'Lista de items del carrito local requerida',
      });
      return;
    }

    const cart = await migrateLocalCartToDbService(userId, localCartItems);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Carrito migrated successfully',
    });
  } catch (error: any) {
    logger.error('Error en migrateLocalCart:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al migrar el carrito',
    });
  }
};