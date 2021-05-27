import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ApiTags } from '@nestjs/swagger';
import { RolesEnum } from '../app/app.roles';
import { UserStatus } from '../users/user-status.enum';
import { JWTPayload } from './jwt.strategy';
import FB from 'fb';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private userService: UsersService, private jwtService: JwtService) {
        FB.options({ version: 'v10.0' });
        // FB.extend({ appId: process.env.FACEBOOK_CLIENT_ID, appSecret: process.env.FACEBOOK_CLIENT_SECRET });
    }

    @Post('google/login')
    async googleLogin(@Body('token') token: string) {
        // todo add audience
        // todo add scope here and on frontend
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return new BadRequestException('Not valid Google user');
        }

        let user = await this.userService.findByEmail(payload.email);
        if (!user) {
            user = await this.userService.createUser({
                email: payload.email,
                firstName: payload.given_name,
                lastName: payload.family_name,
                avatar: payload.picture,
                roles: [RolesEnum.USER],
                status: UserStatus.ACTIVE,
            });
        }

        const jwtPayload: JWTPayload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(jwtPayload),
        };
    }

    @Get('/facebook/login')
    async facebookLogin(@Body('token') token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            FB.api(
                'oauth/access_token',
                {
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    grant_type: 'client_credentials',
                    code: token,
                },
                function (res) {
                    if (!res || res.error) {
                        reject(res);
                        return;
                    }

                    resolve(res);
                }
            );
        });
    }
}
