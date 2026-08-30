import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(userId: string, shippingAddressId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  inventory: true,
                  prices: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const address = await tx.address.findFirst({
        where: { id: shippingAddressId, userId },
      });

      if (!address) {
        throw new NotFoundException('Shipping address not found');
      }

      let subtotalMinor = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product;
        const price = product.prices[0];

        if (product.status !== 'ACTIVE' || !price) {
          throw new BadRequestException(`Product "${product.name}" is unavailable`);
        }

        if (
          product.inventory?.trackStock &&
          !product.inventory.allowBackorder &&
          item.quantity > product.inventory.stock
        ) {
          throw new BadRequestException(`Insufficient stock for "${product.name}"`);
        }

        const lineTotal = price.amountMinor * item.quantity;
        subtotalMinor += lineTotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPriceMinor: price.amountMinor,
          totalPriceMinor: lineTotal,
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          status: 'PENDING_PAYMENT',
          currency: orderItems.length > 0 ? cart.items[0].product.prices[0].currency : 'INR',
          subtotalMinor,
          discountMinor: 0,
          shippingMinor: 0,
          taxMinor: 0,
          totalMinor: subtotalMinor,
          shippingAddressId: address.id,
          items: { create: orderItems },
        },
        include: { items: true, shippingAddress: true },
      });

      for (const item of cart.items) {
        if (item.product.inventory?.trackStock && !item.product.inventory.allowBackorder) {
          await tx.productInventory.update({
            where: { productId: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, shippingAddress: true, payment: true, shipment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true, shippingAddress: true, payment: true, shipment: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private generateOrderNumber() {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `ADV-${new Date().getFullYear()}-${suffix}`;
  }
}
