import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }
}
