/**
 * Rutas de usuario
 * Endpoints para gestión de perfil propio del usuario autenticado
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getUserProfile,
  updateUserProfile,
  userChangePassword,
} from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/change-password', userChangePassword);

export default router;