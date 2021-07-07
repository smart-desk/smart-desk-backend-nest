import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import { Request } from 'express';
import { AdService } from '../ad/ad.service';
import { StripeService } from './stripe.service';
import { ProductsService } from '../products/products.service';

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
    constructor(private stripeService: StripeService, private adService: AdService, private productService: ProductsService) {}

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
                } else if (sessionMetadata['product'] && sessionMetadata['type'] === 'lifting') {
                    await this.productService.liftProduct(sessionMetadata['product']);
                }
            }
        }
    }
}
