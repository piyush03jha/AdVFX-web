import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateMediaDto } from './dto/create-media.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpsertPriceDto } from './dto/upsert-price.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('includeArchived') includeArchived?: string) {
    return this.productsService.findAll(includeArchived === 'true');
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(AdminGuard)
  @Post(':id/pricing')
  setPrice(@Param('id') id: string, @Body() dto: UpsertPriceDto) {
    return this.productsService.setPrice(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/inventory')
  updateInventory(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.productsService.updateInventory(id, dto);
  }

  @UseGuards(AdminGuard)
  @Post(':id/media')
  addMedia(@Param('id') id: string, @Body() dto: CreateMediaDto) {
    return this.productsService.addMedia(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id/media/:mediaId')
  removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.productsService.removeMedia(id, mediaId);
  }
}
