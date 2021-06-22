import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../guards/ws-jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatBaseEventDto } from './dto/chat-base-event.dto';
import { ChatService } from './chat.service';
import { GetChatsDto } from './dto/get-chats.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { ProductsService } from '../products/products.service';
import { PreferContact } from '../products/models/prefer-contact.enum';
import { MailService } from '../mail/mail.service';
import { NotificationTypes } from '../users/models/notification-types.enum';

const options = {
    path: '/socket',
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, authorization',
            'Access-Control-Allow-Origin': req.headers.origin, // todo allow only us
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Max-Age': '1728000',
            'Content-Length': '0',
        };
        res.writeHead(200, headers);
        res.end();
    },
};

export enum ChatEvent {
    GET_CHATS = 'getChats',
    CREATE_CHAT = 'createChat',
    INIT_CHATS = 'initChats',
    NEW_CHAT = 'newChat',
    READ_CHAT = 'readChat',
    GET_MESSAGES = 'getMessages',
    NEW_MESSAGE = 'newMessage',
    JOIN_CHAT = 'joinChat',
    LEAVE_CHAT = 'leaveChat',
}

// todo blocked user maybe too
@WebSocketGateway(options)
@UseGuards(WsJwtAuthGuard)
export class ChatGateway {
    @WebSocketServer() server: Server;

    constructor(private chatService: ChatService, private productsService: ProductsService, private mailService: MailService) {}

    @SubscribeMessage(ChatEvent.INIT_CHATS)
    async initChats(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const chats = await this.chatService.getChatsByUser(data.user.id);
        const rooms = chats.map(chat => chat.id);
        client.join([data.user.id, ...rooms]);
        client.emit(ChatEvent.INIT_CHATS);
    }

    @SubscribeMessage(ChatEvent.CREATE_CHAT)
    async createChat(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChatDto): Promise<void> {
        const product = await this.productsService.getById(data.productId);
        if (product.preferContact === PreferContact.PHONE) {
            throw new WsException('User prefers phone');
        }

        data.user1 = data.user.id;
        data.user2 = product.userId;

        if (data.user1 === data.user2) {
            throw new WsException("Chat participants can't be the same user");
        }

        const chat = await this.chatService.createChat(data);
        const response = {
            id: data.id,
            data: chat,
        };
        client.join(chat.id);
        client.emit(ChatEvent.CREATE_CHAT, response);
        client.to(data.user2).emit(ChatEvent.NEW_CHAT, chat);
    }

    @SubscribeMessage(ChatEvent.GET_CHATS)
    async getChats(@ConnectedSocket() client: Socket, @MessageBody() data: GetChatsDto): Promise<void> {
        const chats = await this.chatService.getChatsByUser(data.user.id);
        const response = {
            id: data.id,
            data: chats,
        };
        client.emit(ChatEvent.GET_CHATS, response);
    }

    @SubscribeMessage(ChatEvent.READ_CHAT)
    async readChat(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        await this.chatService.readMessagesByUser(data.chatId, data.user.id);
        client.emit(ChatEvent.READ_CHAT);
    }

    @SubscribeMessage(ChatEvent.NEW_MESSAGE)
    async newMessage(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChatMessageDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }

        data.userId = data.user.id;
        const chatMessage = await this.chatService.createMessage(data);
        client.to(data.chatId).emit(ChatEvent.NEW_MESSAGE, chatMessage);
        const partnerId = await this.getChatPartner(data.chatId, data.userId);
        // todo указать сообщение, дать ссылку и тд
        await this.mailService.sendMessageToUser(
            partnerId,
            'Новое сообщение',
            'Вам прислали новое сообщение на сайте Smart Desk',
            NotificationTypes.CHAT_MESSAGE
        );
    }

    @SubscribeMessage(ChatEvent.GET_MESSAGES)
    async getMessages(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        const messages = await this.chatService.getMessages(data.chatId);
        client.emit(ChatEvent.GET_MESSAGES, messages);
    }

    @SubscribeMessage(ChatEvent.JOIN_CHAT)
    async joinChat(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        client.join(data.chatId);
        client.emit(ChatEvent.JOIN_CHAT, { chatId: data.chatId });
    }

    private async isUserInChat(userId: string, chatId: string): Promise<boolean> {
        const chat = await this.chatService.getChat(chatId);
        return userId === chat.user1 || userId === chat.user2;
    }

    private async getChatPartner(chatId: string, userId: string): Promise<string> {
        const chat = await this.chatService.getChat(chatId);
        if (chat.user1 === userId) {
            return chat.user2;
        } else if (chat.user2 === userId) {
            return chat.user1;
        }
    }
}
