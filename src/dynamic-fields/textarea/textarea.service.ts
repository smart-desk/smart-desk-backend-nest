import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextareaEntity } from './textarea.entity';

@Injectable()
export class TextareaService extends AbstractFieldService {
    constructor(@InjectRepository(TextareaEntity) private repository: Repository<TextareaEntity>) {
        super();
    }

    getRepository(): Repository<TextareaEntity> {
        return this.repository;
    }
}
