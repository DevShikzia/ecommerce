/**
 * Script de seed para crear el usuario administrator inicial
 * Uso: npm run create-admin
 * Variables requeridas: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { User } from '../models/user.model';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

const createAdminUser = async (): Promise<void> => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    logger.error('Variables de entorno requeridas: ADMIN_EMAIL, ADMIN_PASSWORD');
    logger.info('Ejemplo: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=miPassword npm run create-admin');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Conectado a MongoDB');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      logger.info(`El usuario admin ${ADMIN_EMAIL} ya existe. No se creará nuevamente.`);
      await mongoose.disconnect();
      return;
    }

    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      const allPermissions = await Permission.find().select('_id');
      adminRole = await Role.create({
        name: 'admin',
        description: 'Rol de administrador con acceso total',
        permissions: allPermissions.map(p => p._id)
      });
      logger.info('Rol "admin" creado con todos los permisos');
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: adminRole._id,
      isVerified: true
    });

    logger.info(`Usuario admin creado: ${adminUser.email} con rol "${adminRole.name}"`);
    logger.info('IMPORTANT: Guarde estas credenciales de forma segura');
    logger.info(`  Email: ${ADMIN_EMAIL}`);
    logger.info('  Password: [configurado en variables de entorno]');

    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB');
  } catch (error) {
    logger.error('Error al crear usuario admin:', error);
    process.exit(1);
  }
};

createAdminUser();