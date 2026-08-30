import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [products, activeProducts, archivedProducts, categories, inventories] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { status: 'ACTIVE' } }),
        this.prisma.product.count({ where: { status: 'ARCHIVED' } }),
        this.prisma.category.count({ where: { isActive: true } }),
        this.prisma.productInventory.findMany({
          where: {
            product: { status: 'ACTIVE' },
            trackStock: true,
          },
          select: { stock: true, lowStockAt: true },
        }),
      ]);

    const lowStockProducts = inventories.filter(
      (inventory) => inventory.stock <= inventory.lowStockAt,
    ).length;

    return {
      products: {
        total: products,
        active: activeProducts,
        archived: archivedProducts,
      },
      categories,
      lowStockProducts,
    };
  }
}
