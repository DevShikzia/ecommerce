import mongoose, { Schema, Document } from 'mongoose';

export interface IRating {
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  slug: string;
  isActive: boolean;
  productType?: mongoose.Types.ObjectId;
  customFields?: Record<string, unknown>;
  ratings: IRating[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document {}

const RatingSchema = new Schema<IRating>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    images: [{ type: String }],
    slug: { type: String, required: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
    customFields: { type: Schema.Types.Mixed },
    ratings: [RatingSchema]
  },
  {
    timestamps: true
  }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ slug: 1 });

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);