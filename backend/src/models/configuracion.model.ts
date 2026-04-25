import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod {
  id: string;
  name: string;
  type: 'mercadopago' | 'cash' | 'transfer';
  enabled: boolean;
  instructions?: string;
}

export interface IShippingConfig {
  freeShippingMinAmount: number;
  fixedShippingCost: number;
  enabled: boolean;
}

export interface IConfiguracion {
  storeName: string;
  storeLogo?: string;
  storeEmail: string;
  storePhone: string;
  paymentMethods: IPaymentMethod[];
  shippingConfig: IShippingConfig;
}

export interface IConfiguracionDocument extends IConfiguracion, Document {}

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['mercadopago', 'cash', 'transfer'], required: true },
  enabled: { type: Boolean, default: true },
  instructions: { type: String },
});

const ShippingConfigSchema = new Schema<IShippingConfig>({
  freeShippingMinAmount: { type: Number, default: 15000 },
  fixedShippingCost: { type: Number, default: 500 },
  enabled: { type: Boolean, default: true },
});

const ConfiguracionSchema = new Schema<IConfiguracionDocument>(
  {
    storeName: { type: String, required: true, default: 'Mi Tienda' },
    storeLogo: { type: String },
    storeEmail: { type: String, required: true, default: 'contacto@mitienda.com' },
    storePhone: { type: String, default: '' },
    paymentMethods: { type: [PaymentMethodSchema], default: [] },
    shippingConfig: { type: ShippingConfigSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

ConfiguracionSchema.set('collection', 'Configuracion');

export const Configuracion = mongoose.model<IConfiguracionDocument>(
  'Configuracion',
  ConfiguracionSchema
);

export const getConfiguracion = async (): Promise<IConfiguracionDocument | null> => {
  return Configuracion.findOne().exec();
};

export const updateConfiguracion = async (
  data: Partial<IConfiguracion>
): Promise<IConfiguracionDocument> => {
  const config = await Configuracion.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
  });
  return config;
};