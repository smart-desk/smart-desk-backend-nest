import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './model.entity';

@Injectable()
export class ModelsService {

  constructor(@InjectRepository(Model) private modelRepository: Repository<Model>) {
  }

  getAll(): Promise<Model[]> {
    return this.modelRepository.find();
  }

}
