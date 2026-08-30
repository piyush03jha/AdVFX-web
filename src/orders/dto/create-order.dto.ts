import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
