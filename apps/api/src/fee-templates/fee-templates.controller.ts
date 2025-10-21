import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FeeTemplatesService } from './fee-templates.service';
import { CreateFeeTemplateDto, UpdateFeeTemplateDto } from './fee-templates.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('fee-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeeTemplatesController {
  constructor(private readonly feeTemplatesService: FeeTemplatesService) {}

  @Post()
  @Roles('ADMIN')
  async createTemplate(@Body() dto: CreateFeeTemplateDto) {
    return this.feeTemplatesService.createTemplate(dto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER')
  async getAllTemplates() {
    return this.feeTemplatesService.getAllTemplates();
  }

  @Get('level/:level')
  @Roles('ADMIN', 'TEACHER')
  async getTemplatesByLevel(@Param('level', ParseIntPipe) level: number) {
    return this.feeTemplatesService.getTemplatesByLevel(level);
  }

  @Get('category/:category')
  @Roles('ADMIN', 'TEACHER')
  async getTemplatesByCategory(@Param('category') category: string) {
    return this.feeTemplatesService.getTemplatesByCategory(category);
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  async getTemplateById(@Param('id', ParseIntPipe) id: number) {
    return this.feeTemplatesService.getTemplateById(id);
  }

  @Get(':id/usage-stats')
  @Roles('ADMIN')
  async getTemplateUsageStats(@Param('id', ParseIntPipe) id: number) {
    return this.feeTemplatesService.getTemplateUsageStats(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeTemplateDto,
  ) {
    return this.feeTemplatesService.updateTemplate(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.feeTemplatesService.deleteTemplate(id);
  }
}
