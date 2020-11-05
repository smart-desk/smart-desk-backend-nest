import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Model } from './model.entity';
import { ModelsService } from './models.service';
import { ModelCreateDto, ModelUpdateDto } from './model.dto';

@Controller('models')
@ApiTags('Models')
export class ModelsController {
    constructor(private modelsService: ModelsService) {}

    @Get()
    getAll(): Promise<Model[]> {
        return this.modelsService.getAll();
    }

    @Get(':id')
    getById(@Param('id') id: string): Promise<Model> {
        return this.modelsService.getById(id);
    }

    @Post()
    createModel(@Body() model: ModelCreateDto): Promise<Model> {
        return this.modelsService.create(model);
    }

    @Put(':id')
    updateModel(@Param('id') id: string, @Body() model: ModelUpdateDto): Promise<Model> {
        return this.modelsService.update(id, model);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteModel(@Param('id') id: string) {
        await this.modelsService.delete(id);
    }
}
