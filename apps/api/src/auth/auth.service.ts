import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: `${dto.firstName} ${dto.lastName}`,
          role: dto.role,
          phoneNumber: dto.phoneNumber,
        },
      });

      // If registering a teacher, create teacher profile
      if (dto.role === Role.TEACHER) {
        await this.prisma.teacher.create({
          data: {
            userId: user.id,
          },
        });
      }

      const token = this.jwtService.sign({ 
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
        },
        token, // Return token for controller to set as httpOnly cookie
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new UnauthorizedException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ 
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      token, // Return token for controller to set as httpOnly cookie
    };
  }

  async validateUser(payload: any) {
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
      },
    });
  }

  async verifyEmail(token: string) {
    // Placeholder for email verification logic
    // TODO: Implement email verification with token validation
    return { message: 'Email verification endpoint - to be implemented' };
  }

  async forgotPassword(email: string) {
    // Placeholder for password reset email
    // TODO: Generate reset token and send email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Placeholder for password reset logic
    // TODO: Validate token and update password
    return { message: 'Password reset endpoint - to be implemented' };
  }

  async resendVerificationEmail(email: string) {
    // Placeholder for resending verification email
    // TODO: Generate new verification token and send email
    return { message: 'Verification email resent - to be implemented' };
  }
}