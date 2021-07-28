import { PromoStatus } from '../entities/promo.entity';

export class CreatePromoDto {
    productId: string;
    promoSetId: string;
    startDate: string;
    endDate: string;
    status?: PromoStatus;
}
