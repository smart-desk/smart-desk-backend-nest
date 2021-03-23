import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';
import { DynamicFieldsBaseEntity } from './dynamic-fields-base.entity';
import { getMessageFromValidationErrors } from '../utils/validation';

export abstract class BaseFieldService {
    constructor(
        protected repository: Repository<DynamicFieldsBaseEntity>,
        private entityType: Type<DynamicFieldsBaseEntity>,
        private createDtoType: Type<DynamicFieldsBaseCreateDto>
    ) {}

    getRepository(): Repository<DynamicFieldsBaseEntity> {
        return this.repository;
    }

    async validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(this.createDtoType, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity> {
        const dtoClass = plainToClass(this.createDtoType, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    abstract validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]>;

    abstract validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract validateParams(dtoObject: Record<any, any>): Promise<ValidationError[]>;

    abstract async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]>;
}
