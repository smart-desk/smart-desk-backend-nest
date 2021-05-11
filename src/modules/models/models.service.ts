import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Model } from './model.entity';
import { ModelCreateDto, ModelUpdateDto } from './model.dto';

@Injectable()
export class ModelsService {
    constructor(@InjectRepository(Model) private modelRepository: Repository<Model>) {}

    getAll(): Promise<Model[]> {
        return this.modelRepository.find();
    }

    async getById(id: string): Promise<Model> {
        const model = await this.modelRepository.findOne({ id });
        if (!model) {
            throw new NotFoundException('Model not found');
        }
        return model;
    }

    async create(modelDto: ModelCreateDto): Promise<Model> {
        const model = this.modelRepository.create(modelDto);
        return this.modelRepository.save(model);
    }

    async update(id: string, modelDto: ModelUpdateDto): Promise<Model> {
        const model = await this.modelRepository.findOne({ id });
        if (!model) {
            throw new NotFoundException('Model not found');
        }

        await this.modelRepository.update(model.id, modelDto);

        return this.modelRepository.findOne({ id: model.id });
    }

    async delete(id): Promise<DeleteResult> {
        const model = await this.modelRepository.findOne({ id });
        if (!model) {
            throw new NotFoundException('Model not found');
        }

        return this.modelRepository.delete({ id });
    }
}
