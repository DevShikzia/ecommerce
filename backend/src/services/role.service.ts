/**
 * Servicio de roles
 * Gestiona el CRUD de roles en la base de datos
 */
import mongoose from 'mongoose';
import { Role, IRoleDocument } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { logger } from '../utils/logger';

export interface CreateRoleDto {
  name: string;
  permissions?: string[];
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: string[];
  description?: string;
}

class RoleService {
  async create(createRoleDto: CreateRoleDto): Promise<IRoleDocument> {
    try {
      const roleData = {
        name: createRoleDto.name,
        description: createRoleDto.description
      };

      if (createRoleDto.permissions?.length) {
        const permissions = await Permission.find({
          _id: { $in: createRoleDto.permissions }
        });
        (roleData as { permissions: mongoose.Types.ObjectId[] }).permissions = permissions.map(p => p._id);
      }

      const role = await Role.create(roleData);
      logger.info(`Rol creado: ${createRoleDto.name}`);
      return role;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('duplicate')) {
        throw new Error('El rol ya existe');
      }
      logger.error('Error al crear rol:', error);
      throw error;
    }
  }

  async findAll(): Promise<IRoleDocument[]> {
    try {
      return await Role.find().populate('permissions').sort({ name: 1 }) as unknown as IRoleDocument[];
    } catch (error) {
      logger.error('Error al obtener roles:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IRoleDocument> {
    try {
      const role = await Role.findById(id).populate('permissions');
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      return role as unknown as IRoleDocument;
    } catch (error) {
      logger.error('Error al obtener rol:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<IRoleDocument> {
    try {
      const role = await Role.findOne({ name }).populate('permissions');
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      return role as unknown as IRoleDocument;
    } catch (error) {
      logger.error('Error al obtener rol por nombre:', error);
      throw error;
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<IRoleDocument> {
    try {
      const updateData: Record<string, unknown> = { ...updateRoleDto };

      if (updateRoleDto.permissions?.length) {
        const permissions = await Permission.find({
          _id: { $in: updateRoleDto.permissions }
        });
        updateData.permissions = permissions.map(p => p._id);
      }

      const role = await Role.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).populate('permissions');

      if (!role) {
        throw new Error('Rol no encontrado');
      }
      logger.info(`Rol actualizado: ${id}`);
      return role as unknown as IRoleDocument;
    } catch (error) {
      logger.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const role = await Role.findByIdAndDelete(id);
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      logger.info(`Rol eliminado: ${id}`);
    } catch (error) {
      logger.error('Error al eliminar rol:', error);
      throw error;
    }
  }

  async addPermissions(roleId: string, permissionIds: string[]): Promise<IRoleDocument> {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      const permissions = await Permission.find({ _id: { $in: permissionIds } });
      const newPermissionIds = permissions.map(p => p._id);

      const existingIds = role.permissions.map(p => p.toString());
      const uniqueNewIds = newPermissionIds.filter(
        id => !existingIds.includes(id.toString())
      );

      role.permissions.push(...uniqueNewIds as unknown as mongoose.Types.ObjectId[]);
      await role.save();

      logger.info(`Permisos agregados al rol ${roleId}`);
      return await role.populate('permissions') as unknown as IRoleDocument;
    } catch (error) {
      logger.error('Error al agregar permisos al rol:', error);
      throw error;
    }
  }

  async removePermissions(roleId: string, permissionIds: string[]): Promise<IRoleDocument> {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      role.permissions = role.permissions.filter(
        p => !permissionIds.includes(p.toString())
      ) as unknown as mongoose.Types.ObjectId[];
      await role.save();

      logger.info(`Permisos eliminados del rol ${roleId}`);
      return await role.populate('permissions') as unknown as IRoleDocument;
    } catch (error) {
      logger.error('Error al eliminar permisos del rol:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();