/**
 * Controlador de autenticación
 * Maneja endpoints de registro, login, verificación de email, recuperación de contraseña
 */
import { Request, Response } from 'express';
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  COOKIE_NAME,
  getRefreshTokenCookieOptions,
} from '../services/auth.service';
import { ApiResponse } from '../types/api-response';
import { logger } from '../utils/logger';

interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export const registerUser = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos',
      });
      return;
    }

    const result = await register({ name, email, password });

    res.cookie(
      COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    res.status(201).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      message: 'Usuario registrado correctamente',
    });
  } catch (error) {
    logger.error('Error en registerUser:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al registrar usuario',
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
      return;
    }

    const result = await login({ email, password });

    res.cookie(
      COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      message: 'Login exitoso',
    });
  } catch (error) {
    logger.error('Error en loginUser:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Credenciales inválidas',
    });
  }
};

export const googleAuth = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Token de Google requerido',
      });
      return;
    }

    const { default: jwt } = await import('jsonwebtoken');

    const googlePayload = jwt.decode(credential) as GooglePayload;
    if (!googlePayload?.sub || !googlePayload?.email) {
      res.status(400).json({
        success: false,
        message: 'Token de Google inválido',
      });
      return;
    }

    const result = await googleLogin({
      googleId: googlePayload.sub,
      email: googlePayload.email,
      name: googlePayload.name || googlePayload.email.split('@')[0],
      avatar: googlePayload.picture,
    });

    res.cookie(
      COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      message: 'Login con Google exitoso',
    });
  } catch (error) {
    logger.error('Error en googleAuth:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error con login de Google',
    });
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token de verificación requerido',
      });
      return;
    }

    await verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Email verificado correctamente',
    });
  } catch (error) {
    logger.error('Error en verifyEmailHandler:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token de verificación inválido',
    });
  }
};

export const forgotPasswordHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email requerido',
      });
      return;
    }

    await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: 'Si el email existe, se enviará un enlace de recuperación',
    });
  } catch (error) {
    logger.error('Error en forgotPasswordHandler:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al procesar solicitud',
    });
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    await resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    logger.error('Error en resetPasswordHandler:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al restablecer contraseña',
    });
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    const refreshTokenValue = req.cookies?.[COOKIE_NAME];

    if (!refreshTokenValue) {
      res.status(401).json({
        success: false,
        message: 'Refresh token no encontrado',
      });
      return;
    }

    const result = await refreshAccessToken(refreshTokenValue);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
      message: 'Token refrescado correctamente',
    });
  } catch (error) {
    logger.error('Error en refreshToken:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al refrescar token',
    });
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse<unknown>>
): Promise<void> => {
  try {
    res.clearCookie(COOKIE_NAME, { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
    });
  }
};