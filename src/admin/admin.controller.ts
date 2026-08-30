import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [products, activeProducts, archivedProducts, categories, lowStockProducts] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { status: 'ACTIVE' } }),
        this.prisma.product.count({ where: { status: 'ARCHIVED' } }),
        this.prisma.category.count({ where: { isActive: true } }),
        this.prisma.product.count({
          where: {
            status: 'ACTIVE',
            inventory: {
              stock: {
                lte: this.prisma.productInventory.fields.lowStockAt,
              },
            },
          },
        }),
      ]);

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
