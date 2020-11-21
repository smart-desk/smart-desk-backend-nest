import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { InputTextEntity } from './input-text.entity';
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';

@Injectable()
export class InputTextService extends AbstractFieldService {
    constructor(@InjectRepository(InputTextEntity) private repository: Repository<InputTextEntity>) {
        super();
    }

    getRepository(): Repository<InputTextEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(createDtoObject: Partial<CreateInputTextDto>): CreateInputTextDto {
        return plainToClass(CreateInputTextDto, createDtoObject);
    }

    async validateBeforeCreate(createDtoObject: Partial<CreateInputTextDto>): Promise<ValidationError[]> {
        const createDtoClass = plainToClass(CreateInputTextDto, createDtoObject);
        return await validate(createDtoClass);
    }

    async validateAndCreate(createDtoObject: Partial<CreateInputTextDto>): Promise<InputTextEntity> {
        const createDtoClass = plainToClass(CreateInputTextDto, createDtoObject);
        const errors = await validate(createDtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(createDtoClass);
        return this.repository.save(instance);
    }
}
