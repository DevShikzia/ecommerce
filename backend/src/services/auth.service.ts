/**
 * Servicio de autenticación
 * Maneja registro, login, verificación de email, recuperación de contraseña
 */
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { User, IUserDocument } from '../models/user.model';
import { Role, IRoleDocument } from '../models/role.model';
import { generateTokens, COOKIE_NAME, getRefreshTokenCookieOptions } from '../utils/jwt.utils';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { TokenPayload } from '../utils/jwt.utils';

const resend = new Resend(env.RESEND_API_KEY);

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: Partial<IUserDocument>;
}

const SALT_ROUNDS = 12;

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2);
};

const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2);
};

const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: 'E-commerce <onboarding@resend.dev>',
      to: email,
      subject: 'Verifica tu correo electrónico',
      html: `
        <h1>Bienvenido a E-commerce, ${name}!</h1>
        <p>Gracias por registrarte. Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/verify-email?token=${token}">Verificar correo</a>
        <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
      `,
    });

    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Error al enviar el correo de verificación');
  }
};

const sendResetPasswordEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: 'E-commerce <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h1>Hola ${name}!</h1>
        <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}">Recuperar contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>Este enlace expirece en 1 hora.</p>
      `,
    });

    logger.info(`Reset password email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending reset password email:', error);
    throw new Error('Error al enviar el correo de recuperación');
  }
};

export const register = async (data: RegisterData): Promise<AuthResult> => {
  const { name, email, password } = data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  const hashedPassword = await hashPassword(password);
  const verificationToken = generateVerificationToken();

  let userRole = await Role.findOne({ name: 'user' });
  if (!userRole) {
    userRole = await Role.create({
      name: 'user',
      description: 'Rol de usuario estándar',
      permissions: [],
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: userRole._id,
    isVerified: false,
    resetToken: verificationToken,
    resetTokenExpiry: new Date(Date.now() + 3600000),
  });

  await sendVerificationEmail(email, name, verificationToken);

  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: userRole.name,
  };

  const { accessToken, refreshToken } = generateTokens(
    payload.userId,
    payload.email,
    payload.role
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  };
};

export const login = async (data: LoginData): Promise<AuthResult> => {
  const { email, password } = data;

  const user = await User.findOne({ email: email.toLowerCase() }).populate('role');
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (!user.password) {
    throw new Error('Credenciales inválidas');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  const roleName = (user.role as unknown as IRoleDocument)?.name || 'user';

  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: roleName,
  };

  const { accessToken, refreshToken } = generateTokens(
    payload.userId,
    payload.email,
    payload.role
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
  };
};

export const googleLogin = async (data: GoogleLoginData): Promise<AuthResult> => {
  const { googleId, email, name, avatar } = data;

  let user = await User.findOne({ googleId }).populate('role');

  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() }).populate('role');

    if (user) {
      if (user.googleId) {
        throw new Error('El correo ya está registrado sin Google');
      }

      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      let userRole = await Role.findOne({ name: 'user' });
      if (!userRole) {
        userRole = await Role.create({
          name: 'user',
          description: 'Rol de usuario estándar',
          permissions: [],
        });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: '',
        role: userRole._id,
        googleId,
        avatar,
        isVerified: true,
      });

      user = await User.findById(user._id).populate('role');
    }
  }

  if (!user) {
    throw new Error('Error al procesar login con Google');
  }

  const roleName = (user?.role as any)?.name || 'user';

  const payload: TokenPayload = {
    userId: user!._id.toString(),
    email: user!.email,
    role: roleName,
  };

  const { accessToken, refreshToken } = generateTokens(
    payload.userId,
    payload.email,
    payload.role
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

export const verifyEmail = async (token: string): Promise<boolean> => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Token de verificación inválido o expirado');
  }

  user.isVerified = true;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return true;
};

export const forgotPassword = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return true;
  }

  const resetToken = generateResetToken();
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  await sendResetPasswordEmail(user.email, user.name, resetToken);

  return true;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Token de recuperación inválido o expirado');
  }

  user.password = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return true;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  const payload = require('jsonwebtoken').verify(
    refreshToken,
    env.JWT_REFRESH_SECRET
  ) as TokenPayload;

  const user = await User.findById(payload.userId).populate('role');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const roleName = (user.role as unknown as IRoleDocument)?.name || 'user';

  const newAccessToken = require('jsonwebtoken').sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: roleName,
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { accessToken: newAccessToken };
};

export { COOKIE_NAME, getRefreshTokenCookieOptions };