/**
 * Servicio de administración de usuarios
 * Maneja la lógica de negocio para gestión de usuarios por administradores
 */
import mongoose from 'mongoose';
import { User, IUserDocument, IAddress } from '../models/user.model';
import { Role } from '../models/role.model';
import { logger } from '../utils/logger';

export interface AdminUserUpdateData {
  name?: string;
  email?: string;
  address?: IAddress;
  phone?: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

interface LeanUserWithRole {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role?: { name: string };
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

const getSkip = (page?: number, limit?: number): number => {
  const pageNum = page || 1;
  const limitNum = limit || 20;
  return (pageNum - 1) * limitNum;
};

const formatUserListItem = (user: IUserDocument, roleName: string): UserListItem => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: roleName,
    isVerified: user.isVerified,
    isActive: true,
    createdAt: user.createdAt as Date,
  };
};

export const getUsers = async (query: UserListQuery): Promise<UserListResult> => {
  const { page = 1, limit = 20, role, isActive, search } = query;

  const filter: Record<string, unknown> = {};

  if (role) {
    const roleDoc = await Role.findOne({ name: role });
    if (roleDoc) {
      filter.role = roleDoc._id;
    }
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit)
      .populate('role', 'name')
      .lean(),
    User.countDocuments(filter),
  ]);

  const formattedUsers = users.map((user) => {
    const roleName = (user.role as LeanUserWithRole['role'])?.name || 'user';
    return formatUserListItem(user as unknown as IUserDocument, roleName);
  });

  return { users: formattedUsers, total, page, limit };
};

export const getUserById = async (userId: string): Promise<UserListItem | null> => {
  const user = await User.findById(userId).populate('role', 'name');
  if (!user) {
    return null;
  }

  const roleName = (user.role as LeanUserWithRole['role'])?.name || 'user';
  return formatUserListItem(user, roleName);
};

export const updateUser = async (
  userId: string,
  updateData: AdminUserUpdateData
): Promise<UserListItem | null> => {
  const user = await User.findById(userId).populate('role', 'name');
  if (!user) {
    return null;
  }

  if (updateData.name !== undefined) {
    user.name = updateData.name;
  }

  if (updateData.email !== undefined && updateData.email !== user.email) {
    const existingEmail = await User.findOne({ email: updateData.email.toLowerCase() });
    if (existingEmail && existingEmail._id.toString() !== userId) {
      throw new Error('El correo electrónico ya está en uso');
    }
    user.email = updateData.email.toLowerCase();
  }

  if (updateData.address !== undefined) {
    user.address = updateData.address;
  }

  if (updateData.phone !== undefined) {
    user.phone = updateData.phone;
  }

  if (updateData.avatar !== undefined) {
    user.avatar = updateData.avatar;
  }

  if (updateData.isVerified !== undefined) {
    user.isVerified = updateData.isVerified;
  }

  if (updateData.role !== undefined) {
    const roleDoc = await Role.findOne({ name: updateData.role });
    if (!roleDoc) {
      throw new Error('Rol no encontrado');
    }
    user.role = roleDoc._id;
  }

  await user.save();

  const roleName = (user.role as LeanUserWithRole['role'])?.name || 'user';
  return formatUserListItem(user, roleName);
};

export const toggleUserStatus = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  user.isActive = !user.isActive;
  await user.save();

  logger.info(`Usuario ${userId} ${user.isActive ? 'activado' : 'desactivado'}`);

  return user.isActive;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  user.isActive = false;
  await user.save();

  logger.info(`Usuario ${userId} marcado como inactivo`);

  return true;
};

export const getAllRoles = async (): Promise<{ id: string; name: string }[]> => {
  const roles = await Role.find().select('_id name').lean();
  return roles.map((role: any) => ({
    id: role._id.toString(),
    name: role.name,
  }));
};