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
import { UserStatus } from '../users/models/user-status.enum';
import { JWTPayload } from './jwt.strategy';
import { NotificationTypes } from '../users/models/notification-types.enum';
import FB from 'fb';
import { User } from '../users/entities/user.entity';

dotenv.config();

interface VkAccessTokenResponse {
    access_token: string;
    expires_in: number;
    user_id: number;
}

interface FacebookUserResponse {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    picture: {
        data: {
            height: number;
            width: string;
            is_silhouette: boolean;
            url: string;
        };
    };
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    private vk: VK;
    constructor(private userService: UsersService, private jwtService: JwtService, private httpService: HttpService) {
        this.vk = new VK({
            token: process.env.VK_API_TOKEN,
        });

        FB.options({ version: 'v10.0' });
        FB.extend({ appId: process.env.FACEBOOK_CLIENT_ID, appSecret: process.env.FACEBOOK_CLIENT_SECRET });
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
                roles: [RolesEnum.USER, RolesEnum.ADMIN], // todo admin is only for demo
                status: UserStatus.ACTIVE,
                emailNotifications: Object.values(NotificationTypes) as NotificationTypes[],
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
                roles: [RolesEnum.USER, RolesEnum.ADMIN], // todo admin is only for demo
                status: UserStatus.ACTIVE,
                vkId: vkUser.id.toString(),
                emailNotifications: Object.values(NotificationTypes) as NotificationTypes[],
            });
        }

        const jwtPayload: JWTPayload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(jwtPayload),
        };
    }

    @Post('/facebook/login')
    async facebookLogin(@Body('token') code: string): Promise<any> {
        const facebookUser = await this.getFacebookUserInfoByToken(code);

        // todo update facebookId if found by email
        let user: User;
        if (facebookUser.email) {
            user = await this.userService.findByEmail(facebookUser.email);
        } else {
            user = await this.userService.findByFacebookId(facebookUser.id);
        }

        if (!user) {
            user = await this.userService.createUser({
                email: facebookUser.email,
                firstName: facebookUser.first_name,
                lastName: facebookUser.last_name,
                avatar: facebookUser?.picture?.data?.url,
                roles: [RolesEnum.USER],
                status: UserStatus.ACTIVE,
                emailNotifications: Object.values(NotificationTypes) as NotificationTypes[],
            });
        }

        const jwtPayload: JWTPayload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(jwtPayload),
        };
    }

    private getFacebookUserInfoByToken(token: string): Promise<FacebookUserResponse> {
        return new Promise((resolve, reject) => {
            FB.api('/me', 'GET', { fields: 'id,first_name,last_name,email,picture', access_token: token }, function (res) {
                if (!res || res.error) {
                    reject(res);
                    return;
                }
                resolve(res);
            });
        });
    }
}
