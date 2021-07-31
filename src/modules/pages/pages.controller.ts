import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { Pages } from './entities/pages';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { PageDto } from './dto/page.dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('pages')
@ApiTags('Pages')
export class PagesController {
    constructor(private pagesService: PagesService) {}

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }

    @Get()
    async getAll(): Promise<Pages[]> {
        return await this.pagesService.getPages();
    }

    @Get(':id')
    async getPage(@Param('id', ParseUUIDPipe) id: string): Promise<Pages> {
        return await this.pagesService.getPage(id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'create',
    })
    async create(@Body() body: PageDto, @Req() req: RequestWithUserPayload): Promise<Pages> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return await this.pagesService.createPage(body);
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'update',
    })
    async update(@Body() body: Pages, @Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<UpdateResult> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return await this.pagesService.updatePage(id, body);
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'delete',
    })
    async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<DeleteResult> {
        const isAdmin = this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return await this.pagesService.deletePage(id);
    }
}
