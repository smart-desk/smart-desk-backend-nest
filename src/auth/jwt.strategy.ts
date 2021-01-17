import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

export type RequestWithUserPayload = Request & JWTUserPayload;

export type JWTPayload = {
    id: string;
    email: string;
    roles: string[];
};

export type JWTUserPayload = {
    user: JWTPayload;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: { sub: string; email: string }): Promise<JWTPayload> {
        const id = payload.sub;
        const user = await this.userService.findOne(id);

        return {
            id,
            email: user.email,
            roles: user.roles,
        };
    }
}
