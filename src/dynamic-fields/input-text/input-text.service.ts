import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InputTextEntity } from './input-text.entity';

@Injectable()
export class InputTextService extends AbstractFieldService {
    constructor(@InjectRepository(InputTextEntity) private repository: Repository<InputTextEntity>) {
        super();
    }

    getRepository(): Repository<InputTextEntity> {
        return this.repository;
    }
}
