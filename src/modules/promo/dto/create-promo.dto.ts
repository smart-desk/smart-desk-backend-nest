import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePromoDto {
    @IsNotEmpty()
    @IsUUID()
    promoSetId: string;

    @IsNotEmpty()
    @IsUUID()
    productId: string;
}
