import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
