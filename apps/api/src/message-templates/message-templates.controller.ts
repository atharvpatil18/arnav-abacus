import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { MessageTemplatesService } from './message-templates.service';
import { CreateMessageTemplateDto, UpdateMessageTemplateDto } from './message-templates.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, MessageType } from '@prisma/client';

@Controller('message-templates')
@UseGuards(JwtAuthGuard)
export class MessageTemplatesController {
  constructor(private readonly messageTemplatesService: MessageTemplatesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMessageTemplateDto: CreateMessageTemplateDto) {
    return this.messageTemplatesService.create(createMessageTemplateDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll(@Query('type') type?: MessageType) {
    return this.messageTemplatesService.findAll(type);
  }

  @Get('seed-defaults')
  @Roles(Role.ADMIN)
  seedDefaults() {
    return this.messageTemplatesService.seedDefaultTemplates();
  }

  @Get('type/:type')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByType(@Param('type') type: MessageType) {
    return this.messageTemplatesService.findByType(type);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messageTemplatesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageTemplateDto: UpdateMessageTemplateDto,
  ) {
    return this.messageTemplatesService.update(id, updateMessageTemplateDto);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.ADMIN)
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.messageTemplatesService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.messageTemplatesService.remove(id);
  }

  @Post(':id/process')
  @Roles(Role.ADMIN, Role.TEACHER)
  async processTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body('variables') variables: Record<string, any>,
  ) {
    return this.messageTemplatesService.getProcessedTemplate(id, variables);
  }
}
