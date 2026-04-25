/**
 * Controlador de productos
 * Maneja endpoints CRUD y búsqueda de productos
 */
import { Request, Response } from 'express';
import {
  getProducts as getProductsService,
  getProductById as getProductByIdService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  searchProducts as searchProductsService,
} from '../services/product.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

export const getProducts = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { page = 1, limit = 20, category, sort = '-createdAt' } = req.query;

    const products = await getProductsService({
      page: Number(page),
      limit: Number(limit),
      category: category as string,
      sort: sort as string,
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    logger.error('Error en getProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener productos',
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await getProductByIdService(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    logger.error('Error en getProductById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener producto',
    });
  }
};

export const createProduct = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      tags = [],
      images = [],
      slug,
      productType,
      customFields,
    } = req.body;

    if (!name || !description || price === undefined || !category || !slug) {
      res.status(400).json({
        success: false,
        message: 'Nombre, descripción, precio, categoría y slug son requeridos',
      });
      return;
    }

    const product = await createProductService({
      name,
      description,
      price,
      stock: stock || 0,
      category,
      tags,
      images,
      slug,
      productType,
      customFields,
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en createProduct:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear producto',
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await updateProductService(id, updateData);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Producto actualizado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en updateProduct:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar producto',
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await deleteProductService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar producto',
    });
  }
};

export const searchProducts = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const {
      q = '',
      category,
      tags,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const result = await searchProductsService({
      query: q as string,
      category: category as string,
      tags: typeof tags === 'string' ? tags.split(',') : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error en searchProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error en la búsqueda',
    });
  }
};

export const getAutocomplete = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Consulta de al menos 2 caracteres requerida',
      });
      return;
    }

    const suggestions = await searchProductsService({
      query: q,
      limit: 10,
      autocomplete: true,
    });

    res.status(200).json({
      success: true,
      data: suggestions.map((p: any) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        category: p.category,
      })),
    });
  } catch (error: any) {
    logger.error('Error en getAutocomplete:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error en autocompletado',
    });
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'URL de imagen requerida',
      });
      return;
    }

    const product = await updateProductService(id, {
      $push: { images: imageUrl },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Imagen agregada correctamente',
    });
  } catch (error: any) {
    logger.error('Error en uploadProductImage:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al subir imagen',
    });
  }
};

export const rateProduct = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const authenticatedReq = req as any;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating requerido (1-5)',
      });
      return;
    }

    const product = await updateProductService(id, {
      $push: {
        ratings: {
          user: authenticatedReq.user.id,
          rating,
          comment,
          createdAt: new Date(),
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Rating agregado correctamente',
    });
  } catch (error: any) {
    logger.error('Error en rateProduct:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al agregar rating',
    });
  }
};

export const getCategories = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { getCategories: getCategoriesService } = await import('../services/product.service');
    const categories = await getCategoriesService();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error('Error en getCategories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener categorías',
    });
  }
};

export const getTagsHandler = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { getTags: getTagsService } = await import('../services/product.service');
    const tags = await getTagsService();

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    logger.error('Error en getTagsHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener etiquetas',
    });
  }
};

export const getFacetsHandler = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { getFacets: getFacetsService } = await import('../services/product.service');
    const facets = await getFacetsService();

    res.status(200).json({
      success: true,
      data: facets,
    });
  } catch (error: any) {
    logger.error('Error en getFacetsHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener facetas',
    });
  }
};