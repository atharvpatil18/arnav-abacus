import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        message: '🚀 Backend API is running successfully!',
      };
    } catch (error: any) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        message: 'Database connection failed',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @Get('db')
  async checkDatabase() {
    try {
      const result = await this.prisma.$queryRaw`SELECT current_database(), current_user, version()`;
      return {
        status: 'ok',
        database: result,
        message: 'Database connection successful',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error?.message || 'Unknown error',
      };
    }
  }
}
