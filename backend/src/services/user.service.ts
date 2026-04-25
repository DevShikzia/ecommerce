/**
 * Servicio de usuario
 * Maneja la lógica de negocio para gestión de perfiles y contraseñas
 */
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { User, IUserDocument, IAddress } from '../models/user.model';
import { IRoleDocument } from '../models/role.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const SALT_ROUNDS = 12;

export interface ProfileUpdateData {
  name?: string;
  address?: IAddress;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: IAddress;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
}

const getPublicUserProfile = (user: IUserDocument, roleName: string): UserProfile => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: roleName,
    address: user.address,
    phone: user.phone,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt as Date,
  };
};

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const user = await User.findById(userId).populate('role');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const roleName = (user.role as IRoleDocument)?.name || 'user';
  return getPublicUserProfile(user, roleName);
};

export const updateProfile = async (
  userId: string,
  updateData: ProfileUpdateData
): Promise<UserProfile> => {
  const user = await User.findById(userId).populate('role');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (updateData.name !== undefined) {
    user.name = updateData.name;
  }

  if (updateData.address !== undefined) {
    user.address = updateData.address;
  }

  if (updateData.phone !== undefined) {
    user.phone = updateData.phone;
  }

  if (updateData.avatar !== undefined) {
    if (updateData.avatar.startsWith('data:')) {
      const uploadResult = await uploadAvatarToCloudinary(updateData.avatar);
      if (user.avatar) {
        await deleteAvatarFromCloudinary(user.avatar);
      }
      user.avatar = uploadResult.url;
    } else {
      user.avatar = updateData.avatar;
    }
  }

  await user.save();

  const roleName = (user.role as IRoleDocument)?.name || 'user';
  return getPublicUserProfile(user, roleName);
};

export const changePassword = async (
  userId: string,
  data: ChangePasswordData
): Promise<boolean> => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw new Error('Contraseña actual y nueva contraseña son requeridas');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (!user.password) {
    throw new Error('Este usuario no tiene contraseña configurada');
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error('La contraseña actual es incorrecta');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = hashedPassword;
  await user.save();

  logger.info(`Contraseña cambiada para usuario ${userId}`);

  return true;
};

const uploadAvatarToCloudinary = async (
  base64Data: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      {
        folder: 'ecommerce/avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir avatar a Cloudinary:', error);
          reject(new Error('Error al subir imagen de avatar'));
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    );
  });
};

const deleteAvatarFromCloudinary = async (avatarUrl: string): Promise<boolean> => {
  if (!avatarUrl || !avatarUrl.includes('cloudinary.com')) {
    return true;
  }

  const publicId = avatarUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
  if (!publicId) {
    return true;
  }

  return new Promise((resolve) => {
    cloudinary.uploader.destroy(`ecommerce/avatars/${publicId}`, (error) => {
      if (error) {
        logger.error('Error al eliminar avatar de Cloudinary:', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};