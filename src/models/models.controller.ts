import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Model } from './model.entity';
import { ModelsService } from './models.service';
import { ModelCreateDto } from './model.dto';

@Controller('models')
@ApiTags('Models')
export class ModelsController {
    constructor(private modelsService: ModelsService) {}

    @Get()
    getAll(): Promise<Model[]> {
        return this.modelsService.getAll();
    }

    @Post()
    createModel(@Body() model: ModelCreateDto): Promise<Model> {
        return this.modelsService.create(model);
    }
}
