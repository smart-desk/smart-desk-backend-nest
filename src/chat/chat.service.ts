import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Chat } from './enitities/chat.entity';
import { ChatMessage, ChatMessageStatus } from './enitities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UsersService } from '../users/users.service';
import { AdvertsService } from '../adverts/adverts.service';
import { serializeUser } from '../utils/user.serializer';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
        private userService: UsersService,
        private advertService: AdvertsService
    ) {}

    async createChat(body: CreateChatDto): Promise<Chat> {
        let chat = await this.findChatByParams(body);
        if (chat) {
            return await this.addEntitiesToChat(chat);
        }

        const entity = this.chatRepository.create(body);
        chat = await this.chatRepository.save(entity);
        return this.addEntitiesToChat(chat);
    }

    async getChat(id: string): Promise<Chat> {
        return this.chatRepository.findOne({ id });
    }

    async getChatsByUser(userId: string): Promise<Chat[]> {
        const chats = await this.chatRepository.find({
            where: [{ user1: userId }, { user2: userId }],
        });
        return Promise.all(chats.map(async chat => this.fillAdditionalProperties(chat, userId)));
    }

    async createMessage(body: CreateChatMessageDto): Promise<ChatMessage> {
        const entity = this.chatMessageRepository.create(body);
        return this.chatMessageRepository.save(entity);
    }

    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return this.chatMessageRepository.find({ chatId });
    }

    async getUnreadMessagesCountForUser(chatId: string, userId: string): Promise<number> {
        return this.chatMessageRepository.count({
            where: {
                chatId,
                userId: Not(userId),
                status: ChatMessageStatus.UNREAD,
            },
        });
    }

    async readMessagesByUser(chatId: string, userId: string): Promise<any> {
        return this.chatMessageRepository
            .createQueryBuilder()
            .update()
            .set({ status: ChatMessageStatus.READ })
            .where({ chatId, userId: Not(userId), status: ChatMessageStatus.UNREAD })
            .execute();
    }

    private async findChatByParams(params: CreateChatDto): Promise<Chat> {
        return await this.chatRepository.findOne({
            where: [
                { user1: params.user1, user2: params.user2, advertId: params.advertId },
                { user1: params.user2, user2: params.user1, advertId: params.advertId },
            ],
        });
    }

    private async fillAdditionalProperties(chat: Chat, userId: string): Promise<Chat> {
        chat.unreadMessagesCount = await this.getUnreadMessagesCountForUser(chat.id, userId);
        return this.addEntitiesToChat(chat);
    }

    private async addEntitiesToChat(chat: Chat): Promise<Chat> {
        const advert = await this.advertService.getById(chat.advertId, false);
        const user1 = await this.userService.findOne(chat.user1);
        const user2 = await this.userService.findOne(chat.user2);

        chat.advertData = advert;
        chat.user1Data = serializeUser(user1);
        chat.user2Data = serializeUser(user2);

        return chat;
    }
}
