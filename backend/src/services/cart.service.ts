/**
 * Servicio de carrito
 * Maneja la lógica de negocio para el carrito de compras
 */
import { Cart, ICartDocument, ICartItem } from '../models/cart.model';
import { Product, IProductDocument } from '../models/product.model';
import { logger } from '../utils/logger';

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  productId: string;
  quantity: number;
}

const calculateTotalPrice = (items: ICartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartByUserId = async (
  userId: string
): Promise<ICartDocument | null> => {
  return Cart.findOne({ user: userId }).populate('items.product', 'name images slug price stock');
};

export const getOrCreateCart = async (
  userId: string
): Promise<ICartDocument> => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  return cart;
};

export const addToCart = async (
  userId: string,
  data: AddToCartData
): Promise<ICartDocument> => {
  const { productId, quantity } = data;

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (!product.isActive) {
    throw new Error('Producto no disponible');
  }

  if (product.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  const cart = await getOrCreateCart(userId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (product.stock < newQuantity) {
      throw new Error('Stock insuficiente para la cantidad solicitada');
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
    cart.items[existingItemIndex].productName = product.name;
  } else {
    cart.items.push({
      product: product._id as any,
      productName: product.name,
      quantity,
      price: product.price,
    });
  }

  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();

  logger.info(`Producto ${productId} agregado al carrito del usuario ${userId}`);

  return cart;
};

export const updateCartItem = async (
  userId: string,
  data: UpdateCartItemData
): Promise<ICartDocument> => {
  const { productId, quantity } = data;

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (product.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error('Carrito no encontrado');
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex === -1) {
    throw new Error('Producto no está en el carrito');
  }

  if (quantity <= 0) {
    cart.items.splice(existingItemIndex, 1);
  } else {
    cart.items[existingItemIndex].quantity = quantity;
    cart.items[existingItemIndex].price = product.price;
    cart.items[existingItemIndex].productName = product.name;
  }

  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();

  logger.info(`Cantidad actualizada para producto ${productId} en carrito del usuario ${userId}`);

  return cart;
};

export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<ICartDocument> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error('Carrito no encontrado');
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex === -1) {
    throw new Error('Producto no está en el carrito');
  }

  cart.items.splice(existingItemIndex, 1);
  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();

  logger.info(`Producto ${productId} eliminado del carrito del usuario ${userId}`);

  return cart;
};

export const clearCart = async (userId: string): Promise<void> => {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    logger.info(`Carrito vaciado para el usuario ${userId}`);
  }
};

export const migrateLocalCartToDb = async (
  userId: string,
  localCartItems: { productId: string; quantity: number }[]
): Promise<ICartDocument> => {
  const cart = await getOrCreateCart(userId);

  for (const localItem of localCartItems) {
    const product = await Product.findById(localItem.productId);
    if (!product || !product.isActive) {
      continue;
    }

    const availableQty = Math.min(localItem.quantity, product.stock);
    if (availableQty <= 0) {
      continue;
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === localItem.productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + availableQty;
      const finalQty = Math.min(newQty, product.stock);
      cart.items[existingItemIndex].quantity = finalQty;
    } else {
      cart.items.push({
        product: product._id as any,
        productName: product.name,
        quantity: availableQty,
        price: product.price,
      });
    }
  }

  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();

  logger.info(`Carrito local migrado para el usuario ${userId}`);

  return cart;
};