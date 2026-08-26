import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        slug: dto.slug,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        `A product with slug "${dto.slug}" already exists`,
      );
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
      include: {
        files: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        files: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        files: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          slug: dto.slug,
          NOT: {
            id,
          },
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          `A product with slug "${dto.slug}" already exists`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        files: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}