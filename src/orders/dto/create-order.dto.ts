import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsUUID()
  shippingAddressId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
