import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {

  constructor(private userService: UsersService, private jwtService: JwtService) {
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
      });
    }

    // todo create jwtPayload interface
    const jwtPayload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(jwtPayload),
    };
  }
}