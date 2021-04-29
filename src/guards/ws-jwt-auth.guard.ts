import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../modules/users/users.service';
import { JWTPayload } from '../modules/auth/jwt.strategy';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService, private userService: UsersService) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const client = context.switchToWs().getClient<Socket>();
        const token = client.handshake.headers['authorization'];
        if (!token) {
            throw new WsException('Not authorized');
        }

        try {
            const res = this.jwtService.verify<JWTPayload>(token.split(' ')[1]);
            context.switchToWs().getData().user = await this.userService.findOne(res.sub);
            return true;
        } catch (err) {
            return false;
        }
    }
}
