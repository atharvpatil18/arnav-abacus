import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenditureService } from './expenditure.service';
import { CreateExpenditureDto, UpdateExpenditureDto } from './expenditure.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('expenditure')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenditureController {
  constructor(private readonly expenditureService: ExpenditureService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateExpenditureDto, @Request() req: any) {
    return this.expenditureService.create(dto, req.user.userId);
  }

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ) {
    return this.expenditureService.findAll(startDate, endDate, category);
  }

  @Get('total')
  @Roles('ADMIN')
  getTotalExpenditure(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenditureService.getTotalExpenditure(startDate, endDate);
  }

  @Get('category-wise')
  @Roles('ADMIN')
  getCategoryWiseExpenditure(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenditureService.getCategoryWiseExpenditure(startDate, endDate);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.expenditureService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateExpenditureDto) {
    return this.expenditureService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.expenditureService.remove(+id);
  }
}
