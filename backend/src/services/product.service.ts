/**
 * Servicio de productos
 * Maneja la lógica de negocio CRUD, búsqueda con Atlas Search e integración con Cloudinary
 */
import { v2 as cloudinary } from 'cloudinary';
import { Product, IProduct, IProductDocument } from '../models/product.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}

export interface SearchQuery {
  query?: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  autocomplete?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  category: string;
  tags?: string[];
  images?: string[];
  slug: string;
  productType?: string;
  customFields?: Record<string, unknown>;
}

export type ProductLean = Omit<IProductDocument, never> & { _id: unknown };

const getSkip = (page?: number, limit?: number): number => {
  const pageNum = page || 1;
  const limitNum = limit || 20;
  return (pageNum - 1) * limitNum;
};

export const getProducts = async (
  query: ProductQuery
): Promise<{ products: ProductLean[]; total: number; page: number; limit: number }> => {
  const { page = 1, limit = 20, category, sort = '-createdAt' } = query;

  const filter: Record<string, unknown> = { isActive: true };
  if (category) {
    filter.category = category;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(getSkip(page, limit))
      .limit(limit)
      .populate('productType', 'name')
      .lean() as unknown as ProductLean[],
    Product.countDocuments(filter),
  ]);

  return { products, total, page, limit };
};

export const getProductById = async (id: string): Promise<ProductLean | null> => {
  const result = await Product.findOne({ _id: id, isActive: true })
    .populate('productType', 'name')
    .populate('ratings.user', 'name avatar')
    .lean();
  return result as ProductLean | null;
};

export const getProductBySlug = async (slug: string): Promise<ProductLean | null> => {
  const result = await Product.findOne({ slug: slug.toLowerCase(), isActive: true })
    .populate('productType', 'name')
    .populate('ratings.user', 'name avatar')
    .lean();
  return result as ProductLean | null;
};

export const createProduct = async (
  data: CreateProductData
): Promise<ProductLean> => {
  const existing = await Product.findOne({ slug: data.slug.toLowerCase() });
  if (existing) {
    throw new Error('El slug ya está en uso');
  }

  const product = await Product.create({
    ...data,
    slug: data.slug.toLowerCase(),
    tags: data.tags || [],
    images: data.images || [],
  });

  return product as ProductLean;
};

export const updateProduct = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<ProductLean | null> => {
  if (updateData.slug) {
    const existing = await Product.findOne({
      slug: updateData.slug.toLowerCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error('El slug ya está en uso');
    }
    updateData.slug = updateData.slug.toLowerCase();
  }

  const result = await Product.findByIdAndUpdate(id, updateData, { new: true })
    .populate('productType', 'name')
    .lean();
  return result as ProductLean | null;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  return !!result;
};

export const searchProducts = async (
  searchQuery: SearchQuery
): Promise<ProductLean[]> => {
  const {
    query,
    category,
    tags,
    minPrice,
    maxPrice,
    limit = 20,
  } = searchQuery;

  const filter: Record<string, unknown> = { isActive: true };

  if (query && query.length > 0) {
    filter.$text = { $search: query };
  }

  if (category) {
    filter.category = category;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      (filter.price as Record<string, number>).$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      (filter.price as Record<string, number>).$lte = maxPrice;
    }
  }

  let productsQuery = Product.find(filter);

  if (query && query.length > 0) {
    productsQuery = productsQuery.sort({ score: { $meta: 'textScore' } });
  }

  const results = await productsQuery.limit(limit).populate('productType', 'name').lean();
  return results as unknown as ProductLean[];
};

export const getAutocompleteSuggestions = async (
  query: string
): Promise<ProductLean[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
    ],
  })
    .select('name slug category')
    .limit(10)
    .lean();

  return products as unknown as ProductLean[];
};

export const getCategories = async (): Promise<string[]> => {
  const categories = await Product.distinct('category', { isActive: true });
  return categories;
};

export const getTags = async (): Promise<string[]> => {
  const tags = await Product.distinct('tags', { isActive: true });
  return tags;
};

export const uploadImageToCloudinary = async (
  imagePath: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imagePath,
      {
        folder: 'ecommerce/products',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir imagen a Cloudinary:', error);
          reject(new Error('Error al subir imagen'));
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    );
  });
};

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error) {
        logger.error('Error al eliminar imagen de Cloudinary:', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

export const getFacets = async (): Promise<{
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  priceRange: { min: number; max: number };
}> => {
  const categoryFacets = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  const tagCounts: Record<string, number> = {};
  const productsWithTags = await Product.find(
    { isActive: true, tags: { $exists: true, $ne: [] } },
    { tags: 1 }
  ).lean();

  productsWithTags.forEach((p: any) => {
    if (p.tags) {
      p.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const tagFacets = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const priceStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        min: { $min: '$price' },
        max: { $max: '$price' },
      },
    },
  ]);

  return {
    categories: categoryFacets.map((c) => ({
      name: c._id,
      count: c.count,
    })),
    tags: tagFacets,
    priceRange:
      priceStats.length > 0
        ? { min: priceStats[0].min, max: priceStats[0].max }
        : { min: 0, max: 0 },
  };
};