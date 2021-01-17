import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JWTPayload, RequestWithUserPayload } from '../auth/jwt.strategy';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { BlockedUserGuard } from '../guards/blocked-user.guard';

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
    async getAll(@Req() req: RequestWithUserPayload): Promise<Bookmark[]> {
        return await this.bookmarksService.getUserBookmarks(req.user.id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.BOOKMARK,
        action: 'create',
    })
    async create(@Req() req: RequestWithUserPayload, @Body() data: CreateBookmarkDto): Promise<Bookmark> {
        return await this.bookmarksService.createBookmark(req.user.id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.BOOKMARK,
        action: 'delete',
    })
    async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Bookmark> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();

        return await this.bookmarksService.deleteBookmark(id);
    }

    private async isAdminOrOwner(bookmarkId: string, userPayload: JWTPayload): Promise<boolean> {
        const isOwner = await this.isOwner(bookmarkId, userPayload);
        const isAdmin = this.isAdmin(userPayload);
        return isOwner || isAdmin;
    }

    private async isOwner(bookmarkId: string, userPayload: JWTPayload): Promise<boolean> {
        const owner = await this.bookmarksService.getBookmarkOwner(bookmarkId);
        return owner === userPayload.id;
    }

    private isAdmin(userPayload: JWTPayload): boolean {
        return userPayload.roles && userPayload.roles.some(role => role === RolesEnum.ADMIN);
    }
}
