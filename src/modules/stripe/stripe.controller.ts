import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import { Request } from 'express';
import { AdService } from '../ad/ad.service';
import { StripeService } from './stripe.service';
import { ProductsService } from '../products/products.service';
import { PromotionType } from '../promo/entities/promotion-type.enum';
import { PromoService } from '../promo/promo.service';
import { CreatePromoDto } from '../promo/dto/create-promo.dto';
import { PromoStatus } from '../promo/entities/promo.entity';
import * as dayjs from 'dayjs';
import { PromoSetService } from '../promo/promo-set.service';

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
    constructor(
        private stripeService: StripeService,
        private adService: AdService,
        private productService: ProductsService,
        private promoService: PromoService,
        private promoSetService: PromoSetService
    ) {}

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async webhook(@Body() body: any, @Req() req: Request) {
        const sig = req.headers['stripe-signature'];
        const event = this.stripeService.checkSignatureAndCreateEvent(req.body, sig);

        if (event.type === 'charge.succeeded') {
            const sessionMetadata = event?.data?.object['metadata'];
            if (sessionMetadata) {
                if (sessionMetadata['campaign']) {
                    await this.adService.payCampaign(sessionMetadata['campaign']);
                } else if (sessionMetadata['product'] && sessionMetadata['type'] === PromotionType.LIFTING) {
                    await this.productService.liftProduct(sessionMetadata['product']);
                } else if (
                    sessionMetadata['product'] &&
                    sessionMetadata['type'] === PromotionType.PROMOTION &&
                    sessionMetadata['promoSet']
                ) {
                    const promoSet = await this.promoSetService.getById(sessionMetadata['promoSet']);
                    const createPromo = new CreatePromoDto();
                    createPromo.promoSetId = promoSet.id;
                    createPromo.productId = sessionMetadata['product'];
                    createPromo.status = PromoStatus.ACTIVE;
                    createPromo.startDate = dayjs().toISOString();
                    createPromo.endDate = dayjs().add(promoSet.days, 'days').toISOString();
                    await this.promoService.createPromo(createPromo);
                }
            }
        }
    }
}
