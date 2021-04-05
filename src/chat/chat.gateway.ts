import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatBaseEventDto } from './dto/chat-base-event.dto';
import { ChatService } from './chat.service';

const options = {
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

enum ChatEvent {
    GET_MESSAGES = 'getMessages',
    NEW_MESSAGE = 'newMessage',
    JOIN_CHAT = 'joinChat',
    LEAVE_CHAT = 'leaveChat',
}

@WebSocketGateway(options)
export class ChatGateway {
    constructor(private chatService: ChatService) {}

    @UseGuards(WsJwtAuthGuard) // todo blocked user maybe too
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

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage(ChatEvent.GET_MESSAGES)
    async getMessages(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        const messages = await this.chatService.getMessages(data.chatId);
        client.emit(ChatEvent.GET_MESSAGES, messages); // todo check
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage(ChatEvent.JOIN_CHAT)
    async joinChat(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): Promise<void> {
        const isUserInChat = await this.isUserInChat(data.user.id, data.chatId);
        if (!isUserInChat) {
            throw new WsException('Forbidden');
        }
        client.join(data.chatId);
        client.emit(ChatEvent.JOIN_CHAT, { chatId: data.chatId });
    }

    @UseGuards(WsJwtAuthGuard)
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
