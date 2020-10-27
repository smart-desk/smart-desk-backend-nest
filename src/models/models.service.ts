import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './model.entity';
import { ModelCreateDto } from './model.dto';

@Injectable()
export class ModelsService {

  constructor(@InjectRepository(Model) private modelRepository: Repository<Model>) {
  }

  getAll(): Promise<Model[]> {
    return this.modelRepository.find();
  }

  create(modelDto: ModelCreateDto): Promise<Model> {
    const model = this.modelRepository.create(modelDto)
    return this.modelRepository.save(model);
  }

}
