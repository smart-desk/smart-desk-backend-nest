import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TextareaEntity } from './textarea.entity';
import { CreateTextareaDto } from './dto/create-textarea.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';

@Injectable()
export class TextareaService extends AbstractFieldService {
    constructor(@InjectRepository(TextareaEntity) private repository: Repository<TextareaEntity>) {
        super();
    }

    getRepository(): Repository<TextareaEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(createDtoObject: Partial<CreateTextareaDto>): CreateTextareaDto {
        return plainToClass(CreateTextareaDto, createDtoObject);
    }

    async validateBeforeCreate(createDtoObject: Partial<CreateTextareaDto>): Promise<ValidationError[]> {
        const createDtoClass = this.transformCreateObjectToClass(createDtoObject);
        return await validate(createDtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndCreate(createDtoObject: Partial<CreateTextareaDto>): Promise<TextareaEntity> {
        const createDtoClass = this.transformCreateObjectToClass(createDtoObject);
        const errors = await validate(createDtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(createDtoClass);
        return this.repository.save(instance);
    }
}
