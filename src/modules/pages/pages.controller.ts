import * as dotenv from 'dotenv';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { ResourceEnum } from '../app/app.roles';
import { Pages } from './entities/pages';

dotenv.config();

@Controller('pages')
@ApiTags('Pages')
export class PagesController {
    constructor(private pagesService: PagesService) {}

    @Get('pages')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'read',
    })
    async getAll(): Promise<Pages[]> {
        return await this.pagesService.getPages();
    }

    @Get('pages:id')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'read',
    })
    async get(@Req() id: string): Promise<Pages> {
        return await this.pagesService.getPage(id);
    }

    @Post('pages')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'create',
    })
    async create(@Body() body: Pages): Promise<Pages> {
        return await this.pagesService.createPage(body);
    }

    @Patch('pages:id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PAGES,
        action: 'update',
    })
    async update(@Body() body: any, id): Promise<any> {
        return await this.pagesService.updatePage(id, body);
    }

    @Delete('pages:id')
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
