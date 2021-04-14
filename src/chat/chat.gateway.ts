import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatBaseEventDto } from './dto/chat-base-event.dto';
import { ChatService } from './chat.service';
import { GetChatsDto } from './dto/get-chats.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { AdvertsService } from '../adverts/adverts.service';

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
    GET_MESSAGES = 'getMessages',
    NEW_MESSAGE = 'newMessage',
    JOIN_CHAT = 'joinChat',
    LEAVE_CHAT = 'leaveChat',
}

// todo blocked user maybe too
@WebSocketGateway(options)
@UseGuards(WsJwtAuthGuard)
export class ChatGateway {
    constructor(private chatService: ChatService, private advertsService: AdvertsService) {}

    @SubscribeMessage(ChatEvent.CREATE_CHAT)
    async createChat(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChatDto): Promise<void> {
        const advert = await this.advertsService.getById(data.advertId);
        data.user1 = data.user.id;
        data.user2 = advert.userId;

        if (data.user1 === data.user2) {
            throw new WsException("Chat participants can't be the same user");
        }

        const chat = await this.chatService.createChat(data);
        const response = {
            id: data.id,
            data: chat,
        };
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

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage(ChatEvent.NEW_MESSAGE)
    async newMessage(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChatMessageDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }

        data.userId = data.user.id;
        const chatMessage = await this.chatService.createMessage(data);
        client.to(data.chatId).emit(ChatEvent.NEW_MESSAGE, chatMessage);
    }

    @SubscribeMessage(ChatEvent.GET_MESSAGES)
    async getMessages(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        const messages = await this.chatService.getMessages(data.chatId);
        client.emit(ChatEvent.GET_MESSAGES, messages); // todo check
    }

    // todo probably makes sense to do it on connect event
    @SubscribeMessage(ChatEvent.INIT_CHATS)
    async initChats(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        client.join(data.user.id);
        client.emit(ChatEvent.INIT_CHATS);
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

    @SubscribeMessage(ChatEvent.LEAVE_CHAT)
    async leaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        client.leave(data.chatId);
        client.emit(ChatEvent.LEAVE_CHAT, { chatId: data.chatId });
    }

    private async isUserInChat(userId: string, chatId: string): Promise<boolean> {
        const chat = await this.chatService.getChat(chatId);
        return userId === chat.user1 || userId === chat.user2;
    }
}
