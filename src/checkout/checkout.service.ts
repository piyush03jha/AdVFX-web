import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutQuoteDto } from './dto/checkout-quote.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuote(userId: string, dto: CheckoutQuoteDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                inventory: true,
                prices: {
                  where: { isActive: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
                media: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });

    if (!address) throw new NotFoundException('Shipping address not found');

    let subtotalMinor = 0;
    const items = cart.items.map((item) => {
      const product = item.product;
      const price = product.prices[0];

      if (product.status !== 'ACTIVE' || !price) {
        throw new BadRequestException(`Product "${product.name}" is unavailable`);
      }

      if (item.quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for "${product.name}"`);
      }

      const available = product.inventory?.trackStock && !product.inventory.allowBackorder
        ? Math.max(0, (product.inventory.stock ?? 0) - (product.inventory.reserved ?? 0))
        : null;

      if (available !== null && item.quantity > available) {
        throw new BadRequestException(`Only ${available} unit(s) of "${product.name}" are currently available`);
      }

      const lineTotalMinor = price.amountMinor * item.quantity;
      subtotalMinor += lineTotalMinor;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPriceMinor: price.amountMinor,
        lineTotalMinor,
        currency: price.currency,
        imageUrl: product.media.find((media) => media.isPrimary && media.type === 'IMAGE')?.url
          ?? product.media.find((media) => media.type === 'IMAGE')?.url
          ?? null,
      };
    });

    const currency = items[0]?.currency ?? 'INR';
    const shippingMinor = 0;
    const taxMinor = 0;
    const discountMinor = 0;
    const totalMinor = subtotalMinor + shippingMinor + taxMinor - discountMinor;

    return {
      currency,
      items,
      shippingAddress: address,
      summary: {
        subtotalMinor,
        shippingMinor,
        taxMinor,
        discountMinor,
        totalMinor,
      },
      payment: {
        required: true,
        status: 'NOT_STARTED',
        provider: 'RAZORPAY_PENDING_CONFIGURATION',
      },
    };
  }

  async getStatus(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true, shipment: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      payment: order.payment,
      shipment: order.shipment,
      totalMinor: order.totalMinor,
      currency: order.currency,
    };
  }
}
