import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Model } from './model.entity';
import { ModelsService } from './models.service';
import { ModelCreateDto, ModelUpdateDto } from './model.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';

@Controller('models')
@ApiTags('Models')
export class ModelsController {
    constructor(private modelsService: ModelsService) {}

    // todo only for admin
    @Get()
    getAll(): Promise<Model[]> {
        return this.modelsService.getAll();
    }

    @Get(':id')
    getById(@Param('id') id: string): Promise<Model> {
        return this.modelsService.getById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.MODEL,
        action: 'create',
    })
    createModel(@Body() model: ModelCreateDto): Promise<Model> {
        return this.modelsService.create(model);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.MODEL,
        action: 'update',
    })
    updateModel(@Param('id', ParseUUIDPipe) id: string, @Body() model: ModelUpdateDto): Promise<Model> {
        return this.modelsService.update(id, model);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.MODEL,
        action: 'delete',
    })
    async deleteModel(@Param('id', ParseUUIDPipe) id: string) {
        await this.modelsService.delete(id);
    }
}
