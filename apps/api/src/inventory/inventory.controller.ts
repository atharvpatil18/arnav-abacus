import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UserId } from '../auth/user-id.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    return this.inventoryService.create(data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAll(@Query('lowStock') lowStock?: string) {
    return this.inventoryService.getAll(lowStock === 'true');
  }

  @Get('low-stock-report')
  @Roles(Role.ADMIN)
  async getLowStockReport() {
    return this.inventoryService.getLowStockReport();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.getById(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.inventoryService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.delete(id);
  }

  @Post('allocate')
  @Roles(Role.ADMIN)
  async allocate(
    @Body() body: { itemId: number; studentId: number; quantity: number },
    @UserId() userId: number
  ) {
    return this.inventoryService.allocate(body.itemId, body.studentId, body.quantity, userId);
  }

  @Post('allocations/:id/return')
  @Roles(Role.ADMIN)
  async returnItem(@Param('id', ParseIntPipe) allocationId: number) {
    return this.inventoryService.returnItem(allocationId);
  }

  @Post('allocations/:id/mark-lost')
  @Roles(Role.ADMIN)
  async markAsLost(@Param('id', ParseIntPipe) allocationId: number) {
    return this.inventoryService.markAsLost(allocationId);
  }

  @Get('allocations/list')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAllocations(
    @Query('studentId', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('itemId', new ParseIntPipe({ optional: true })) itemId?: number
  ) {
    return this.inventoryService.getAllocations(studentId, itemId);
  }
}
