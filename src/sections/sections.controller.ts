import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionCreateDto } from './section.dto';
import { Section } from './section.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('sections')
@ApiTags('Sections')
export class SectionsController {
    constructor(private sectionsService: SectionsService) {}

    @Post()
    createModel(@Body() section: SectionCreateDto): Promise<Section> {
        return this.sectionsService.create(section);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteModel(@Param('id') id: string) {
        await this.sectionsService.delete(id);
    }
}
