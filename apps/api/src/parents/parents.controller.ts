import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateParentProfileDto, UpdateParentPasswordDto } from './parents.dto';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.parentsService.getDashboard(req.user.id);
  }

  @Get('children')
  async getChildren(@Req() req: any) {
    return this.parentsService.getChildren(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateParentProfileDto) {
    return this.parentsService.updateProfile(req.user.id, dto);
  }

  @Patch('password')
  async updatePassword(@Req() req: any, @Body() dto: UpdateParentPasswordDto) {
    return this.parentsService.updatePassword(req.user.id, dto);
  }
}
