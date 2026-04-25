export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  direccion?: Address;
  telefono?: string;
  avatar?: string;
  verificado: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface Address {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

export interface UserRole {
  _id: string;
  nombre: string;
  permisos: UserPermission[];
  descripcion?: string;
}

export interface UserPermission {
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