import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { UsersModule } from '../users/users.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AdvertsModule } from '../adverts/adverts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './enitities/chat-message.entity';
import { Chat } from './enitities/chat.entity';

dotenv.config();

@Module({
    providers: [ChatGateway, ChatService],
    imports: [
        TypeOrmModule.forFeature([Chat, ChatMessage]),
        AdvertsModule,
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [ChatController],
})
export class ChatModule {}
