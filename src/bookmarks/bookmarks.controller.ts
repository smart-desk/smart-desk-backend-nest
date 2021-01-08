import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { JWTUserPayload } from '../auth/jwt.strategy';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

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

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.BOOKMARK,
        action: 'create',
    })
    async updateProfile(@Req() req: Request & JWTUserPayload, @Body() data: CreateBookmarkDto): Promise<Bookmark> {
        return await this.bookmarksService.createBookmark(req.user.id, data);
    }
}
