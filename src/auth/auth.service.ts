import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PrismaService } from '../prisma/prisma.service';
import type { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from './auth.types';

interface AuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Backend authentication foundation.
 *
 * Tokens are intentionally kept in-process for this first backend slice.
 * When Redis is introduced for queues, session persistence should move there
 * without changing the controller/guard contract.
 */
@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, AuthSession>();

  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, secret: string) {
    const expectedSecret = process.env.ADMIN_AUTH_SECRET;

    if (!expectedSecret) {
      throw new Error('ADMIN_AUTH_SECRET is not configured');
    }

    if (secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || user.role !== ('ADMIN' as UserRole)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);

    this.sessions.set(token, {
      token,
      userId: user.id,
      expiresAt,
    });

    return {
      token,
      expiresAt,
      user: this.serializeUser(user),
    };
  }

  async authenticate(token: string): Promise<AuthenticatedUser> {
    const session = this.sessions.get(token);

    if (!session || session.expiresAt <= new Date()) {
      if (session) this.sessions.delete(token);
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      this.sessions.delete(token);
      throw new UnauthorizedException('User account is inactive');
    }

    return this.serializeUser(user);
  }

  logout(token: string) {
    this.sessions.delete(token);
    return { message: 'Signed out successfully' };
  }

  private serializeUser(user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
