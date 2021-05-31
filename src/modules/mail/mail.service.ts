import { Injectable } from '@nestjs/common';
import * as mg from 'mailgun-js';
import * as dotenv from 'dotenv';
import { UsersService } from '../users/users.service';
import { NotificationTypes } from '../users/models/notification-types.enum';
import { User } from '../users/entities/user.entity';

dotenv.config();

@Injectable()
export class MailService {
    private mg: mg.Mailgun;

    constructor(private userService: UsersService) {
        this.mg = mg({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAIL_DOMAIN, host: 'api.eu.mailgun.net' });
    }

    async sendMessageToUser(user: string | User, subject: string, html: string, type: NotificationTypes): Promise<void> {
        let resultUser: User;
        if (typeof user === 'string') {
            resultUser = await this.userService.findOne(user);
        } else {
            resultUser = user;
        }

        if (!resultUser?.email) {
            return;
        }

        if (!resultUser.emailNotifications || !resultUser.emailNotifications.includes(type)) {
            return;
        }

        try {
            await this.mg.messages().send({
                from: 'Smart Desk Team <no-reply@mail.smart-desk.me>',
                to: resultUser.email,
                subject,
                html,
            });
        } catch (err) {
            // todo send to sentry
            console.log(err);
        }
    }
}
