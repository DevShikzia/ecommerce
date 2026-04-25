import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface IPaymentInfo {
  method: string;
  transactionId?: string;
  status?: string;
  details?: Record<string, unknown>;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface IOrder {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  street: { type: String, required: true },
  number: { type: String, required: true },
  floor: { type: String },
  apartment: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true }
});

const PaymentInfoSchema = new Schema<IPaymentInfo>({
  method: { type: String, required: true },
  transactionId: { type: String },
  status: { type: String },
  details: { type: Schema.Types.Mixed }
});

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentInfo: { type: PaymentInfoSchema },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: Object.values(OrderStatus), 
      default: OrderStatus.PENDING 
    },
    paymentMethod: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);