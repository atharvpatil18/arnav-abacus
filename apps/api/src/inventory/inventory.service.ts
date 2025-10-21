import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Create Item
  async create(data: any) {
    return this.prisma.inventoryItem.create({ data });
  }

  // Get All Items
  async getAll(lowStock: boolean = false) {
    const where: any = {};
    
    if (lowStock) {
      where.quantity = { lte: this.prisma.inventoryItem.fields.minQuantity };
    }

    return this.prisma.inventoryItem.findMany({
      where,
      include: {
        _count: { select: { allocations: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Get Item by ID
  async getById(id: number) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        allocations: {
          include: { student: true }
        }
      }
    });
  }

  // Update Item
  async update(id: number, data: any) {
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  // Delete Item
  async delete(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  // Allocate to Student
  async allocate(itemId: number, studentId: number, quantity: number, allocatedBy: number) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: itemId } });
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }

    // Create allocation
    const allocation = await this.prisma.inventoryAllocation.create({
      data: {
        itemId,
        studentId,
        quantity,
        status: 'ALLOCATED',
        allocatedAt: new Date()
      }
    });

    // Update inventory
    await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: { decrement: quantity } }
    });

    return allocation;
  }

  // Return Item
  async returnItem(allocationId: number) {
    const allocation = await this.prisma.inventoryAllocation.findUnique({
      where: { id: allocationId },
      include: { item: true }
    });

    if (!allocation) {
      throw new Error('Allocation not found');
    }

    if (allocation.status !== 'ALLOCATED') {
      throw new Error('Item already returned or lost');
    }

    // Update allocation status
    await this.prisma.inventoryAllocation.update({
      where: { id: allocationId },
      data: {
        status: 'RETURNED',
        returnedAt: new Date()
      }
    });

    // Update inventory
    await this.prisma.inventoryItem.update({
      where: { id: allocation.itemId },
      data: { quantity: { increment: allocation.quantity } }
    });

    return { message: 'Item returned successfully' };
  }

  // Mark as Lost
  async markAsLost(allocationId: number) {
    return this.prisma.inventoryAllocation.update({
      where: { id: allocationId },
      data: { status: 'LOST' }
    });
  }

  // Get Allocations
  async getAllocations(studentId?: number, itemId?: number) {
    return this.prisma.inventoryAllocation.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(itemId && { itemId })
      },
      include: {
        item: true,
        student: true
      },
      orderBy: { allocatedAt: 'desc' }
    });
  }

  // Low Stock Report
  async getLowStockReport() {
    return this.prisma.$queryRaw`
      SELECT * FROM "InventoryItem"
      WHERE quantity <= "minQuantity"
      ORDER BY (quantity - "minQuantity") ASC
    `;
  }
}
