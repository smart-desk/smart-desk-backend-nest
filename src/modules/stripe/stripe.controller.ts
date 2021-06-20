import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import { Request } from 'express';
import { AdService } from '../ad/ad.service';
import { StripeService } from './stripe.service';

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
    constructor(private stripeService: StripeService, private adService: AdService) {}

    @Post('webhook')
    async webhook(@Body() body: any, @Req() req: Request) {
        const sig = req.headers['stripe-signature'];
        const event = this.stripeService.checkSignatureAndCreateEvent(req.body, sig);

        if (event.type === 'charge.succeeded') {
            const sessionMetadata = event?.data?.object['metadata'];
            if (sessionMetadata && sessionMetadata['campaign']) {
                await this.adService.payCampaign(sessionMetadata['campaign']);
            }
        }
    }
}
