import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { UsersModule } from '../users/users.module';
import { ChatService } from './chat.service';

dotenv.config();

@Module({
    providers: [ChatGateway, ChatService],
    imports: [
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
    ],
})
export class ChatModule {}
