import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';
import { JWTUserPayload } from '../auth/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private usersService: UsersService) {}


    @Get(':id')
    async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return await this.usersService.fineOne(id);
    }

    @Get('profile')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request & JWTUserPayload): Promise<User> {
        return await this.usersService.fineOne(req.user.id);
    }

    @Patch('profile')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'update',
    })
    async updateProfile(@Req() req: Request & JWTUserPayload, @Body() data: UpdateUserDto): Promise<User> {
        return await this.usersService.updateUser(req.user.id, data);
    }
}
