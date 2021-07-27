import * as dotenv from 'dotenv';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { ResourceEnum } from '../app/app.roles';

dotenv.config();

export interface Page {
    id: string;
    title: string;
    content: string;
}

@Controller('pages')
@ApiTags('Pages')
export class PagesController {
    constructor(private pagesService: PagesService) {}

    @Get() // прислать действующие пейджес
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'read',
    })
    async getAll(): Promise<Page[]> {
        return await this.pagesService.getPages();
    }

    @Get('pages') // прислать одну действующие пейджес
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'read',
    })
    async get(@Req() id: string): Promise<Page> {
        return await this.pagesService.getPage(id);
    }

    @Post('pages') // создать новую пейджес
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'create',
    })
    async create(@Body() body: Page): Promise<string> {
        return await this.pagesService.createPage(body);
    }

    @Patch('pages:id') // отредактировать действвующую пейджес
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'update',
    })
    async update(@Body() body: any, id): Promise<any> {
        return await this.pagesService.updatePage(id, body);
    }

    @Delete('pages:id') //Удалить действующую пейджес
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'delete',
    })
    async delete(id: string): Promise<any> {
        return await this.pagesService.deletePage(id);
    }
}
