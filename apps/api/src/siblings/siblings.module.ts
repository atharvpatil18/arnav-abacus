import { Module } from '@nestjs/common';
import { SiblingsController } from './siblings.controller';
import { SiblingsService } from './siblings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SiblingsController],
  providers: [SiblingsService, PrismaService],
  exports: [SiblingsService],
})
export class SiblingsModule {}
