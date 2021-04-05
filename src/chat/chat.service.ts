import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './enitities/chat.entity';
import { ChatMessage } from './enitities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>
    ) {}

    async createChat(body: CreateChatDto): Promise<Chat> {
        // todo check if chat already exists
        const entity = this.chatRepository.create(body);
        return this.chatRepository.save(entity);
    }

    async getChatsByUser(userId: string): Promise<Chat[]> {
        return this.chatRepository.find({
            where: [{ user1: userId }, { user2: userId }],
        });
    }

    async createMessage(body: ChatMessageDto): Promise<ChatMessage> {
        // todo check if user can write to this chat
        const entity = this.chatMessageRepository.create(body);
        return this.chatMessageRepository.save(entity);
    }

    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return this.chatMessageRepository.find({ chatId });
    }
}
