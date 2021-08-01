import { IsNotEmpty, IsUUID } from 'class-validator';

export class PayPromoDto {
    @IsNotEmpty()
    @IsUUID()
    promoSetId: string;

    @IsNotEmpty()
    @IsUUID()
    productId: string;
}
