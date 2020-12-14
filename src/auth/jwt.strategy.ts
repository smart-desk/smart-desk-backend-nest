import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JWTPayload = {
    id: string;
    email: string;
};

export type JWTUserPayload = {
    user: JWTPayload;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: { sub: string; email: string }): Promise<JWTPayload> {
        return { id: payload.sub, email: payload.email };
    }
}
