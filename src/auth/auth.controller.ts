import { Body, Controller, Post } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class AuthController {

  @Post('google/login')
  async googleLogin(@Body('token') token: string): Promise<boolean> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
    });

    const payload = ticket.getPayload();
    if (payload) {
      return true;
    }
    return false;
  }
}
