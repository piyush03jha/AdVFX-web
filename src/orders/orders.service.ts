import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryReservationStatus, OrderStatus, Prisma } from '@prisma/client';
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

const RESERVATION_MINUTES = 30;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(userId: string, shippingAddressId: string) {
    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60_000);

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

        if (item.quantity <= 0) {
          throw new BadRequestException(`Invalid quantity for "${product.name}"`);
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
        const inventory = item.product.inventory;
        if (!inventory || !inventory.trackStock || inventory.allowBackorder) {
          continue;
        }

        const available = inventory.stock - inventory.reserved;
        if (available < item.quantity) {
          throw new BadRequestException(`Insufficient stock for "${item.product.name}"`);
        }

        const updated = await tx.productInventory.updateMany({
          where: {
            productId: item.product.id,
            stock: { gte: inventory.reserved + item.quantity },
          },
          data: { reserved: { increment: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new BadRequestException(
            `Stock changed for "${item.product.name}"; please try again`,
          );
        }

        await tx.inventoryReservation.create({
          data: {
            productId: item.product.id,
            orderId: order.id,
            quantity: item.quantity,
            status: 'ACTIVE',
            expiresAt,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return this.findOneForTransaction(tx, order.id);
    });
  }

  async findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        shipment: true,
        inventoryReservations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        shipment: true,
        inventoryReservations: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAllAdmin(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        shipment: true,
        inventoryReservations: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        shipment: true,
        inventoryReservations: true,
        user: true,
      },
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

    return this.prisma.$transaction(async (tx) => {
      if (status === 'CANCELLED') {
        await this.releaseReservations(tx, id, InventoryReservationStatus.RELEASED);
      }

      if (status === 'CONFIRMED' && order.status === 'PENDING_PAYMENT') {
        await this.consumeReservations(tx, id);
      }

      return tx.order.update({
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
        include: {
          items: true,
          shippingAddress: true,
          payment: true,
          shipment: true,
          inventoryReservations: true,
          user: true,
        },
      });
    });
  }

  async expireReservations() {
    const expired = await this.prisma.inventoryReservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: new Date() },
      },
      select: { orderId: true },
      distinct: ['orderId'],
    });

    for (const reservation of expired) {
      await this.prisma.$transaction(async (tx) => {
        await this.releaseReservations(tx, reservation.orderId, InventoryReservationStatus.EXPIRED);

        const order = await tx.order.findUnique({
          where: { id: reservation.orderId },
          select: { status: true },
        });

        if (order?.status === 'PENDING_PAYMENT') {
          await tx.order.update({
            where: { id: reservation.orderId },
            data: { status: 'CANCELLED' },
          });
        }
      });
    }

    return { expiredOrders: expired.length };
  }

  private async releaseReservations(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: InventoryReservationStatus,
  ) {
    const reservations = await tx.inventoryReservation.findMany({
      where: { orderId, status: 'ACTIVE' },
    });

    for (const reservation of reservations) {
      const updated = await tx.productInventory.updateMany({
        where: {
          productId: reservation.productId,
          reserved: { gte: reservation.quantity },
        },
        data: { reserved: { decrement: reservation.quantity } },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          `Unable to release inventory reservation for product ${reservation.productId}`,
        );
      }

      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: {
          status,
          releasedAt: new Date(),
        },
      });
    }
  }

  private async consumeReservations(
    tx: Prisma.TransactionClient,
    orderId: string,
  ) {
    const reservations = await tx.inventoryReservation.findMany({
      where: { orderId, status: 'ACTIVE' },
    });

    for (const reservation of reservations) {
      const inventory = await tx.productInventory.findUnique({
        where: { productId: reservation.productId },
      });

      if (!inventory || inventory.reserved < reservation.quantity) {
        throw new BadRequestException(
          `Unable to consume inventory reservation for product ${reservation.productId}`,
        );
      }

      const updated = await tx.productInventory.updateMany({
        where: {
          productId: reservation.productId,
          stock: { gte: reservation.quantity },
          reserved: { gte: reservation.quantity },
        },
        data: {
          stock: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          `Unable to finalize inventory for product ${reservation.productId}`,
        );
      }

      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CONSUMED',
          releasedAt: null,
        },
      });
    }
  }

  private findOneForTransaction(
    tx: Prisma.TransactionClient,
    orderId: string,
  ) {
    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        shipment: true,
        inventoryReservations: true,
      },
    });
  }

  private generateOrderNumber() {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `ADV-${new Date().getFullYear()}-${suffix}`;
  }
}
