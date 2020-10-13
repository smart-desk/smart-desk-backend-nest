import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // google login should open
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleRedirect(@Req() req) {
    console.log(req); // todo save in database
  }
}
