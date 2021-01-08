import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { JWTUserPayload } from '../auth/jwt.strategy';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';

@ApiTags('Bookmarks')
@Controller('bookmarks')
export class BookmarksController {
    constructor(private bookmarksService: BookmarksService) {}

    @Get()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.BOOKMARK,
        action: 'read',
    })
    async getAll(@Req() req: Request & JWTUserPayload): Promise<Bookmark[]> {
        return await this.bookmarksService.getUserBookmarks(req.user.id);
    }

    // @Get('profile')
    // @ApiBearerAuth('access-token')
    // @UseGuards(JwtAuthGuard)
    // async getProfile(@Req() req: Request & JWTUserPayload): Promise<User> {
    //     return await this.bookmarksService.fineOne(req.user.id);
    // }
    //
    // @Patch('profile')
    // @ApiBearerAuth('access-token')
    // @UseGuards(JwtAuthGuard, ACGuard)
    // @UseRoles({
    //     resource: ResourceEnum.USER,
    //     action: 'update',
    // })
    // async updateProfile(@Req() req: Request & JWTUserPayload, @Body() data: UpdateUserDto): Promise<User> {
    //     return await this.usersService.updateUser(req.user.id, data);
    // }
}
