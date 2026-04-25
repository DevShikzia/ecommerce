/**
 * Rutas de administración de usuarios
 * Endpoints para gestión de usuarios por administradores
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permisos.middleware';
import {
  listUsers,
  getUser,
  adminUpdateUser,
  setUserStatus,
  adminDeleteUser,
  listRoles,
} from '../controllers/admin-user.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', checkPermission, listUsers);
router.get('/roles', listRoles);
router.get('/:id', checkPermission, getUser);
router.put('/:id', checkPermission, adminUpdateUser);
router.patch('/:id/status', checkPermission, setUserStatus);
router.delete('/:id', checkPermission, adminDeleteUser);

export default router;