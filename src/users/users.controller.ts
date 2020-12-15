import { Controller, Get, Param, ParseUUIDPipe, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({ groups: ['owner'] })
    async getProfile(@Req() req: Request): Promise<User> {
        return await this.usersService.fineOne((req.user as { id: string }).id);
    }

    @Get(':id')
    async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return await this.usersService.fineOne(id);
    }
}
