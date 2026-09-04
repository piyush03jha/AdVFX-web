import { IsString, IsNotEmpty } from 'class-validator';

export class CheckoutQuoteDto {
  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;
}
