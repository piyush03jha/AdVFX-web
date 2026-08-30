import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

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
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

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
          product: { connect: { id: product.id } },
          productName: product.name,
          quantity: item.quantity,
          unitPriceMinor: price.amountMinor,
          totalPriceMinor: lineTotal,
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          user: { connect: { id: userId } },
          status: 'PENDING_PAYMENT',
          currency: cart.items[0].product.prices[0].currency,
          subtotalMinor,
          discountMinor: 0,
          shippingMinor: 0,
          taxMinor: 0,
          totalMinor: subtotalMinor,
          shippingAddress: { connect: { id: address.id } },
          items: { create: orderItems },
        },
        include: { items: true, shippingAddress: true },
      });

      for (const item of cart.items) {
        if (item.product.inventory?.trackStock && !item.product.inventory.allowBackorder) {
          const result = await tx.productInventory.updateMany({
            where: {
              productId: item.product.id,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count !== 1) {
            throw new BadRequestException(`Stock changed for "${item.product.name}"; please try again`);
          }
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

  async findAllAdmin(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: true, shippingAddress: true, payment: true, shipment: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, shippingAddress: true, payment: true, shipment: true, user: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOneAdmin(id);
    const allowed = ORDER_TRANSITIONS[order.status];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot change order from ${order.status} to ${status}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'SHIPPED'
          ? {
              shipment: {
                upsert: {
                  create: { status: 'SHIPPED', shippedAt: new Date() },
                  update: { status: 'SHIPPED', shippedAt: new Date() },
                },
              },
            }
          : {}),
        ...(status === 'DELIVERED'
          ? {
              shipment: {
                upsert: {
                  create: { status: 'DELIVERED', deliveredAt: new Date() },
                  update: { status: 'DELIVERED', deliveredAt: new Date() },
                },
              },
            }
          : {}),
      },
      include: { items: true, shippingAddress: true, payment: true, shipment: true, user: true },
    });
  }

  private generateOrderNumber() {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `ADV-${new Date().getFullYear()}-${suffix}`;
  }
}
