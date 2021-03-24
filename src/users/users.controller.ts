import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { JWTPayload, RequestWithUserPayload } from '../auth/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { BlockedUserGuard } from '../guards/blocked-user.guard';
import { BlockUserDto } from './dto/block-user.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: RequestWithUserPayload): Promise<User> {
        return await this.usersService.findOne(req.user.id);
    }

    @Patch('profile')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'update',
    })
    async updateProfile(@Req() req: RequestWithUserPayload, @Body() data: UpdateUserDto): Promise<User> {
        return await this.usersService.updateUser(req.user.id, data);
    }

    @Get()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'read',
    })
    async getUsers(@Req() req: RequestWithUserPayload): Promise<User[]> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return await this.usersService.findAll();
    }

    @Get(':id')
    async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return await this.usersService.findOne(id);
    }

    @Patch(':id/roles')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'update',
    })
    async changeRoles(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: RequestWithUserPayload,
        @Body() body: UpdateUserRolesDto
    ): Promise<User> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.usersService.updateUserRoles(id, body.roles);
    }

    @Patch(':id/block')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'update',
    })
    async blockUser(@Param('id', ParseUUIDPipe) id: string, @Body() body: BlockUserDto, @Req() req: RequestWithUserPayload): Promise<User> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.usersService.blockUser(id, body.value);
    }

    @Get(':id/phone')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.USER,
        action: 'read',
    })
    async getPhone(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<string> {
        // todo count how many phones are requested by one user and set a limit
        const user = await this.usersService.findOne(id);
        if (!user.isPhoneVerified || !user.phone) {
            throw new NotFoundException('Phone not found');
        }
        return user.phone;
    }

    private isAdmin(userPayload: JWTPayload): boolean {
        return userPayload.roles && userPayload.roles.some(role => role === RolesEnum.ADMIN);
    }
}
