import { BadRequestException, Body, Controller, Get, HttpService, Post, Query } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { VK } from 'vk-io';
import { JwtService } from '@nestjs/jwt';
import { UsersUserFull } from 'vk-io/lib/api/schemas/objects';
import { ApiTags } from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsersService } from '../users/users.service';
import { RolesEnum } from '../app/app.roles';
import { UserStatus } from '../users/user-status.enum';
import { JWTPayload } from './jwt.strategy';

dotenv.config();

interface VkAccessTokenResponse {
    access_token: string;
    expires_in: number;
    user_id: number;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    private vk: VK;
    constructor(private userService: UsersService, private jwtService: JwtService, private httpService: HttpService) {
        this.vk = new VK({
            token: process.env.VK_API_TOKEN,
        });
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
            return new BadRequestException('Invalid Google user');
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

    @Get('vk/login')
    async vkLogin(@Query('code') code: string, @Query('host') host: string) {
        const accessTokenResponse = await this.httpService
            .get<VkAccessTokenResponse>(
                `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}&client_secret=${process.env.VK_APP_SECRET}&code=${code}&redirect_uri=${host}`
            )
            .pipe(
                take(1),
                catchError(err => {
                    console.log(err?.data);
                    return of(null);
                })
            )
            .toPromise<AxiosResponse<VkAccessTokenResponse>>();

        if (!accessTokenResponse) {
            return new BadRequestException('Invalid VK user');
        }

        let vkUser: UsersUserFull;
        const vkUsers = await this.vk.api.users.get({
            fields: ['photo_200_orig'],
            user_ids: [accessTokenResponse.data.user_id.toString()],
            access_token: accessTokenResponse.data.access_token,
        });

        if (vkUsers.length) {
            vkUser = vkUsers[0];
        } else {
            return new BadRequestException('Invalid VK user');
        }

        let user = await this.userService.findByVkId(vkUser.id.toString());
        if (!user) {
            user = await this.userService.createUser({
                firstName: vkUser.first_name,
                lastName: vkUser.last_name,
                avatar: vkUser.photo_200_orig,
                roles: [RolesEnum.USER],
                status: UserStatus.ACTIVE,
                vkId: vkUser.id.toString(),
            });
        }

        const jwtPayload: JWTPayload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(jwtPayload),
        };
    }
}
