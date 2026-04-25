export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  slug: string;
  isActive: boolean;
  productType?: ProductType;
  customFields?: Record<string, unknown>;
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ProductType {
  _id: string;
  name: string;
  fields: ProductTypeField[];
}

export interface ProductTypeField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  unit?: string;
  options?: string[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  slug: string;
  isActive?: boolean;
  productType?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}