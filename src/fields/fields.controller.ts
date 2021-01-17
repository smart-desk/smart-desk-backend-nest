import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { Field } from './field.entity';
import { FieldsService } from './fields.service';
import { ApiTags } from '@nestjs/swagger';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';

@Controller('fields')
@ApiTags('Fields')
export class FieldsController {
    constructor(private fieldsService: FieldsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.FIELD,
        action: 'create',
    })
    createField(@Body() body: FieldCreateDto): Promise<Field> {
        return this.fieldsService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.FIELD,
        action: 'update',
    })
    updateField(@Param('id', ParseUUIDPipe) id: string, @Body() body: FieldUpdateDto): Promise<Field> {
        return this.fieldsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.FIELD,
        action: 'delete',
    })
    async deleteField(@Param('id', ParseUUIDPipe) id: string) {
        await this.fieldsService.delete(id);
    }
}
