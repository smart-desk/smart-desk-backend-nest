import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {

  constructor(private userService: UsersService) {
  }

  @Post('google/login')
  async googleLogin(@Body('token') token: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return new BadRequestException('Not valid Google user');
    }

    const user = await this.userService.findByEmail(payload.email);
    if (user) {
      return user;
    } else {
      return await this.userService.createUser({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      });
    }
  }
}
