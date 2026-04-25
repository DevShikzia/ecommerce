/**
 * Rutas de productos
 * Endpoints para CRUD y búsqueda de productos
 */
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAutocomplete,
  uploadProductImage,
  rateProduct,
  getCategories,
  getTagsHandler,
  getFacetsHandler,
} from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permisos.middleware';

const router = Router();

router.get('/', getProducts);

router.get('/search', searchProducts);

router.get('/autocomplete', getAutocomplete);

router.get('/categories', getCategories);

router.get('/tags', getTagsHandler);

router.get('/facets', getFacetsHandler);

router.get('/:id', getProductById);

router.post('/', authMiddleware, checkPermission, createProduct);

router.put('/:id', authMiddleware, checkPermission, updateProduct);

router.delete('/:id', authMiddleware, checkPermission, deleteProduct);

router.post('/:id/images', authMiddleware, checkPermission, uploadProductImage);

router.post('/:id/rate', authMiddleware, rateProduct);

export default router;