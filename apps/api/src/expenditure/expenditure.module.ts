import { Module } from '@nestjs/common';
import { ExpenditureController } from './expenditure.controller';
import { ExpenditureService } from './expenditure.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExpenditureController],
  providers: [ExpenditureService, PrismaService],
})
export class ExpenditureModule {}
