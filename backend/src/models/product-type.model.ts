import mongoose, { Schema, Document } from 'mongoose';

export interface IProductField {
  name: string;
  type: string;
  required: boolean;
  unit?: string;
}

export interface IProductType {
  name: string;
  fields: IProductField[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductTypeDocument extends IProductType, Document {}

const ProductFieldSchema = new Schema<IProductField>({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  unit: { type: String, trim: true }
});

const ProductTypeSchema = new Schema<IProductTypeDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    fields: { type: [ProductFieldSchema], default: [] }
  },
  {
    timestamps: true
  }
);

export const ProductType = mongoose.model<IProductTypeDocument>('ProductType', ProductTypeSchema);