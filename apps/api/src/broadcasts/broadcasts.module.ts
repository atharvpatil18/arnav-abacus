import { Module } from '@nestjs/common';
import { BroadcastsController } from './broadcasts.controller';
import { BroadcastsService } from './broadcasts.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BroadcastsController],
  providers: [BroadcastsService, PrismaService],
  exports: [BroadcastsService],
})
export class BroadcastsModule {}
