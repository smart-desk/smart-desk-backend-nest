import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { AdService } from '../ad/ad.service';

dotenv.config();

const STRIPE_WEBHOOK_SECRET_KEY = process.env.STRIPE_WEBHOOK_SECRET_KEY;

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
    private stripe: Stripe;

    constructor(private adService: AdService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
    }

    @Post('webhook')
    async webhook(@Body() body: any, @Req() req: Request) {
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET_KEY);
        } catch (err) {
            console.log(`Stripe error:`, err);
            throw new BadRequestException('Payment error');
        }

        if (event.type === 'charge.succeeded') {
            const sessionMetadata = event?.data?.object['metadata'];
            if (sessionMetadata && sessionMetadata['campaign']) {
                await this.adService.payCampaign(sessionMetadata['campaign']);
            }
        }
    }
}
