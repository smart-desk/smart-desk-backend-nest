import { BadRequestException, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
// @ts-ignore
import Stripe, { SessionCreateParams } from 'stripe';

dotenv.config();

const STRIPE_WEBHOOK_SECRET_KEY = process.env.STRIPE_WEBHOOK_SECRET_KEY;

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
    }

    async createPaymentSession(params: SessionCreateParams): Promise<{ id: string }> {
        const session = await this.stripe.checkout.sessions.create(params);

        return { id: session.id };
    }

    checkSignatureAndCreateEvent(rawBody: any, signature: string | string[]): Stripe.Event {
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET_KEY);
        } catch (err) {
            console.log(`Stripe error:`, err);
            throw new BadRequestException('Payment error');
        }
        return event;
    }
}
