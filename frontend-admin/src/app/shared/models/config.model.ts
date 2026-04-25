export interface Configuracion {
  _id: string;
  nombreTienda?: string;
  logo?: string;
  colores?: {
    primario: string;
    secundario: string;
    acento: string;
    fondo: string;
    texto: string;
  };
  metodosPago?: MetodoPago[];
  reglasEnvio?: ReglaEnvio[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MetodoPago {
  id: string;
  nombre: string;
  activo: boolean;
  config?: Record<string, unknown>;
}

export interface ReglaEnvio {
  id: string;
  nombre: string;
  activo: boolean;
  condiciones: {
    pesoMin?: number;
    pesoMax?: number;
    precioMin?: number;
    precioMax?: number;
    zonas: string[];
  };
  precio: number;
}