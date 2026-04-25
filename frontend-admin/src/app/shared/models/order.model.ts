export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface PaymentInfo {
  method: string;
  transactionId?: string;
  status?: string;
  details?: Record<string, unknown>;
}

export interface Order {
  _id: string;
  user: UserSummary;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  _id: string;
  name?: string;
  email: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}