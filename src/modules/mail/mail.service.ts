import { Injectable } from '@nestjs/common';
import * as mg from 'mailgun-js';
import * as dotenv from 'dotenv';
import { UsersService } from '../users/users.service';

dotenv.config();

@Injectable()
export class MailService {
    private mg: mg.Mailgun;

    constructor(private userService: UsersService) {
        this.mg = mg({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAIL_DOMAIN, host: 'api.eu.mailgun.net' });
    }

    async sendMessageToUser(userId: string, subject: string, html: string) {
        const user = await this.userService.findOne(userId);
        if (user?.email) {
            try {
                await this.mg.messages().send({
                    from: 'Smart Desk Team <no-reply@mail.smart-desk.me>',
                    to: user.email,
                    subject,
                    html,
                });
            } catch (err) {
                // todo send to sentry
                console.log(err);
            }
        }
    }
}
