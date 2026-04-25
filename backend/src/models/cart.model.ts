import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
}

export interface ICart {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartDocument extends ICart, Document {}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const CartSchema = new Schema<ICartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
    totalPrice: { type: Number, required: true, min: 0, default: 0 }
  },
  {
    timestamps: true
  }
);

CartSchema.index({ user: 1 });

export const Cart = mongoose.model<ICartDocument>('Cart', CartSchema);