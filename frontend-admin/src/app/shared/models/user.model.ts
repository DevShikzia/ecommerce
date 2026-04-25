export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: Role;
  direccion?: Address;
  telefono?: string;
  avatar?: string;
  verificado: boolean;
  createdAt: string;
}

export interface Address {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

export interface Role {
  _id: string;
  nombre: string;
  permisos: Permission[];
  descripcion?: string;
}

export interface Permission {
  _id: string;
  recurso: string;
  accion: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ver';
  descripcion: string;
  autogenerado: boolean;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}