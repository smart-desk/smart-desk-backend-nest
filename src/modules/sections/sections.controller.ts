import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionCreateDto } from './section.dto';
import { Section } from './section.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';

@Controller('sections')
@ApiTags('Sections')
export class SectionsController {
    constructor(private sectionsService: SectionsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.SECTION,
        action: 'create',
    })
    createSection(@Body() section: SectionCreateDto): Promise<Section> {
        return this.sectionsService.create(section);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.SECTION,
        action: 'delete',
    })
    async deleteSection(@Param('id', ParseUUIDPipe) id: string) {
        await this.sectionsService.delete(id);
    }
}
