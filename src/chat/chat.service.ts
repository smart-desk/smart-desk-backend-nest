import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './enitities/chat.entity';
import { ChatMessage } from './enitities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>
    ) {}

    async createChat(body: CreateChatDto): Promise<Chat> {
        const chat = await this.findChatByParams(body);
        if (chat) {
            return chat;
        }

        const entity = this.chatRepository.create(body);
        return this.chatRepository.save(entity);
    }

    async getChat(id: string): Promise<Chat> {
        return this.chatRepository.findOne({ id });
    }

    async getChatsByUser(userId: string): Promise<Chat[]> {
        return this.chatRepository.find({
            where: [{ user1: userId }, { user2: userId }],
        });
    }

    async createMessage(body: CreateChatMessageDto): Promise<ChatMessage> {
        const entity = this.chatMessageRepository.create(body);
        return this.chatMessageRepository.save(entity);
    }

    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return this.chatMessageRepository.find({ chatId });
    }

    private async findChatByParams(params: CreateChatDto): Promise<Chat> {
        return await this.chatRepository.findOne({
            where: [
                { user1: params.user1, user2: params.user2, advertId: params.advertId },
                { user1: params.user2, user2: params.user1, advertId: params.advertId },
            ],
        });
    }
}
