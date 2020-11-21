import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioEntity } from './radio.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRadioDto } from './dto/create-radio.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';

@Injectable()
export class RadioService extends AbstractFieldService {
    constructor(@InjectRepository(RadioEntity) private repository: Repository<RadioEntity>) {
        super();
    }

    getRepository(): Repository<RadioEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(createDtoObject: Partial<CreateRadioDto>): CreateRadioDto {
        return plainToClass(CreateRadioDto, createDtoObject);
    }

    async validateBeforeCreate(createDtoObject: Partial<CreateRadioDto>): Promise<ValidationError[]> {
        const createDtoClass = plainToClass(CreateRadioDto, createDtoObject);
        return await validate(createDtoClass);
    }

    async validateAndCreate(createDtoObject: Partial<CreateRadioDto>): Promise<RadioEntity> {
        const createDtoClass = plainToClass(CreateRadioDto, createDtoObject);
        const errors = await validate(createDtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(createDtoClass);
        return this.repository.save(instance);
    }
}
