import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Field } from './field.entity';
import { FieldsService } from './fields.service';
import { ApiTags } from '@nestjs/swagger';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';

@Controller('fields')
@ApiTags('Fields')
export class FieldsController {
    constructor(private fieldsService: FieldsService) {}

    @Post()
    createField(@Body() body: FieldCreateDto): Promise<Field> {
        return this.fieldsService.create(body);
    }

    @Put(':id')
    updateField(@Param('id') id: string, @Body() body: FieldUpdateDto): Promise<Field> {
        return this.fieldsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteField(@Param('id') id: string) {
        await this.fieldsService.delete(id);
    }
}
