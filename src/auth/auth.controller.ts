import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ApiTags } from '@nestjs/swagger';
import { RolesEnum } from '../app/app.roles';
import { UserStatus } from '../users/user-status.enum';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private userService: UsersService, private jwtService: JwtService) {}

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

        // todo create jwtPayload interface
        const jwtPayload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(jwtPayload),
        };
    }
}
