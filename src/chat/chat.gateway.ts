import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';

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
    @WebSocketServer()
    server: Server;

    @UseGuards(WsJwtAuthGuard) // todo blocked user maybe too
    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: any): void {
        this.server.emit('answer', data);
    }
}
