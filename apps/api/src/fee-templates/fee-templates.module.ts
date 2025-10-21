import { Module } from '@nestjs/common';
import { FeeTemplatesController } from './fee-templates.controller';
import { FeeTemplatesService } from './fee-templates.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FeeTemplatesController],
  providers: [FeeTemplatesService, PrismaService],
  exports: [FeeTemplatesService],
})
export class FeeTemplatesModule {}
