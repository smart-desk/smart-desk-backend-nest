import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Field } from './field.entity';
import { FieldsService } from './fields.service';
import { ApiTags } from '@nestjs/swagger';
import { FieldCreateDto } from './field.dto';

@Controller('fields')
@ApiTags('Fields')
export class FieldsController {
    constructor(private fieldsService: FieldsService) {}

    // todo temp
    @Get(':id')
    getField(@Param('id') id: string): Promise<Field> {
        return this.fieldsService.getById(id);
    }

    @Post()
    createField(@Body() body: FieldCreateDto): Promise<Field> {
        return this.fieldsService.create(body);
    }
}
