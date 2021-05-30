import { Injectable } from '@nestjs/common';
import * as mg from 'mailgun-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
    private mg: mg.Mailgun;
    constructor() {
        this.mg = mg({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAIL_DOMAIN });
    }

    sendMessage(to: string, subject: string, text: string) {
        this.mg.messages().send({
            from: 'Smart Desk Team <smart-desk@mail.smart-desk.me>',
            to,
            subject,
            text,
        });
    }
}
