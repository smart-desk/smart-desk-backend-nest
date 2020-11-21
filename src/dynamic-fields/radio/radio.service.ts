import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioEntity } from './radio.entity';

@Injectable()
export class RadioService extends AbstractFieldService {
    constructor(@InjectRepository(RadioEntity) private repository: Repository<RadioEntity>) {
        super();
    }

    getRepository(): Repository<RadioEntity> {
        return this.repository;
    }
}
