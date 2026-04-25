/**
 * Rutas de autenticación
 * Endpoints para registro, login, verificación de email, recuperación de contraseña
 */
import { Router } from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  verifyEmailHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  refreshToken,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/google', googleAuth);

router.post('/verify-email', verifyEmailHandler);

router.post('/forgot-password', forgotPasswordHandler);

router.post('/reset-password', resetPasswordHandler);

router.post('/refresh-token', refreshToken);

router.post('/logout', logout);

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;