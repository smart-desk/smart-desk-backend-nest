import { Controller, Get } from '@nestjs/common';
import { Model } from './model.entity';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {

  constructor(private modelsService: ModelsService) {
  }

  @Get()
  getAll(): Promise<Model[]> {
    return this.modelsService.getAll();
  }

}
