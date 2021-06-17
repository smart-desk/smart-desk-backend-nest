import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

const STRIPE_WEBHOOK_SECRET_KEY = process.env.STRIPE_WEBHOOK_SECRET_KEY;

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
    }

    @Post('webhook')
    webhook(@Body() body: any, @Req() req: Request) {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET_KEY);
        } catch (err) {
            console.log(`Stripe error:`, err);
        }
    }
}
