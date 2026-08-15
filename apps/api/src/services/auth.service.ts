import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.config';
import { env } from '../config/env.config';
import { UnauthorizedError } from '../errors';
import { LoginRequest, LoginResponse, RefreshResponse } from '@repo/shared';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, email, role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, role: 'ADMIN' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async login(payload: LoginRequest): Promise<{ response: LoginResponse; refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);

    return {
      response: {
        user: {
          id: user.id,
          email: user.email,
        },
        accessToken,
      },
      refreshToken,
    };
  }

  async refresh(refreshToken: string | undefined): Promise<{ response: RefreshResponse; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token', 'AUTH_REFRESH_INVALID');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid refresh token', 'AUTH_REFRESH_INVALID');
      }

      const tokens = this.generateTokens(user.id, user.email);

      return {
        response: {
          user: {
            id: user.id,
            email: user.email,
          },
          accessToken: tokens.accessToken,
        },
        refreshToken: tokens.refreshToken,
      };
    } catch (_error) {
      throw new UnauthorizedError('Invalid refresh token', 'AUTH_REFRESH_INVALID');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found', 'AUTH_UNAUTHORIZED');
    }

    return user;
  }
}

export const authService = new AuthService();
