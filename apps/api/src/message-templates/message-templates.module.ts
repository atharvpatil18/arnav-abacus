import { Module } from '@nestjs/common';
import { MessageTemplatesController } from './message-templates.controller';
import { MessageTemplatesService } from './message-templates.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MessageTemplatesController],
  providers: [MessageTemplatesService, PrismaService],
  exports: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
