import mongoose, { Schema, Document } from 'mongoose';

export interface IDescuentos {
  enabled: boolean;
  rules: IDiscountRule[];
  codes: IDiscountCode[];
}

export interface IDiscountRule {
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  active: boolean;
}

export interface IDiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
}

export interface IPaymentMethod {
  nombre: string;
  habilitado: boolean;
  config: Record<string, unknown>;
}

export interface IShippingRules {
  montoMinimoGratis: number;
  costoFijo: number;
  habilitado: boolean;
}

export interface IColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface IMercadoPagoConfig {
  accessTokenEncrypted: string;
  publicKeyEncrypted: string;
}

export interface IConfiguracion {
  nombreEcommerce: string;
  logo: string;
  colores: IColors;
  metodosPago: IPaymentMethod[];
  reglasEnvio: IShippingRules;
  moneda: string;
  descuentos: IDescuentos;
  mercadoPago: IMercadoPagoConfig;
}

export interface IConfiguracionDocument extends IConfiguracion, Document {}

const DiscountCodeSchema = new Schema<IDiscountCode>({
  code: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxUses: { type: Number },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const DiscountRuleSchema = new Schema<IDiscountRule>({
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minPurchase: { type: Number },
  maxDiscount: { type: Number },
  active: { type: Boolean, default: true },
});

const DescuentosSchema = new Schema<IDescuentos>({
  enabled: { type: Boolean, default: false },
  rules: { type: [DiscountRuleSchema], default: [] },
  codes: { type: [DiscountCodeSchema], default: [] },
});

const MercadoPagoConfigSchema = new Schema<IMercadoPagoConfig>({
  accessTokenEncrypted: { type: String, default: '' },
  publicKeyEncrypted: { type: String, default: '' },
});

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  nombre: { type: String, required: true },
  habilitado: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed, default: {} },
});

const ShippingRulesSchema = new Schema<IShippingRules>({
  montoMinimoGratis: { type: Number, default: 15000 },
  costoFijo: { type: Number, default: 500 },
  habilitado: { type: Boolean, default: true },
});

const ColorsSchema = new Schema<IColors>({
  primary: { type: String, default: '#000000' },
  secondary: { type: String, default: '#666666' },
  background: { type: String, default: '#FFFFFF' },
  text: { type: String, default: '#333333' },
});

const ConfiguracionSchema = new Schema<IConfiguracionDocument>(
  {
    nombreEcommerce: { type: String, required: true, default: 'Mi Tienda' },
    logo: { type: String, default: '' },
    colores: { type: ColorsSchema, default: () => ({}) },
    metodosPago: { type: [PaymentMethodSchema], default: [] },
    reglasEnvio: { type: ShippingRulesSchema, default: () => ({}) },
    moneda: { type: String, default: 'ARS' },
    descuentos: { type: DescuentosSchema, default: () => ({}) },
    mercadoPago: { type: MercadoPagoConfigSchema, default: () => ({}) },
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

export const createConfiguracion = async (
  data: Partial<IConfiguracion>
): Promise<IConfiguracionDocument> => {
  const config = new Configuracion(data);
  return config.save();
};

export const updateConfiguracion = async (
  data: Partial<IConfiguracion>
): Promise<IConfiguracionDocument> => {
  const config = await Configuracion.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
  }).exec();
  if (!config) {
    throw new Error('Error al actualizar configuración');
  }
  return config;
};

export const getOrCreateConfiguracion = async (): Promise<IConfiguracionDocument> => {
  const existingConfig = await Configuracion.findOne().exec();
  if (existingConfig) {
    return existingConfig;
  }

  const newConfig = new Configuracion({
    nombreEcommerce: 'Mi Tienda',
    logo: '',
    colores: {
      primary: '#000000',
      secondary: '#666666',
      background: '#FFFFFF',
      text: '#333333',
    },
    metodosPago: [],
    reglasEnvio: {
      montoMinimoGratis: 15000,
      costoFijo: 500,
      habilitado: true,
    },
    moneda: 'ARS',
  });

  return newConfig.save() as Promise<IConfiguracionDocument>;
};