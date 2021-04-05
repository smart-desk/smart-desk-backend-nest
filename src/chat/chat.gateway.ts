import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatBaseEventDto } from './dto/chat-base-event.dto';

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

@WebSocketGateway(options)
export class ChatGateway {
    @UseGuards(WsJwtAuthGuard) // todo blocked user maybe too
    @SubscribeMessage('message')
    handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChatMessageDto): void {
        client.to(data.chatId).emit('message', data);
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('joinChat')
    joinChat(@ConnectedSocket() client: Socket, @MessageBody() data: ChatBaseEventDto): void {
        // todo check if user can join chat
        client.join(data.chatId);
        client.emit('joinChat', { chatId: data.chatId });
    }
}
