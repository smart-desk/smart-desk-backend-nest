import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export type RequestWithUserPayload = Request & JWTUserPayload;

export type JWTPayload = { sub: string; email: string };

export type JWTUserPayload = {
    user: User;
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

    async validate(payload: { sub: string; email: string }): Promise<User> {
        const id = payload.sub;
        return await this.userService.findOne(id);
    }
}
