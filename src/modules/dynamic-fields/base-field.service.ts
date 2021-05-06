import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';
import { DynamicFieldsBaseEntity } from './dynamic-fields-base.entity';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { SortingType } from '../adverts/models/sorting';

export abstract class BaseFieldService {
    protected constructor(
        protected repository: Repository<DynamicFieldsBaseEntity>,
        private entityType: Type<DynamicFieldsBaseEntity>,
        private createDtoType: Type<DynamicFieldsBaseCreateDto>,
        private updateDtoType: Type<DynamicFieldsBaseUpdateDto>,
        private paramsDtoType: Type<Record<any, any>>
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

    async validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(this.updateDtoType, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity> {
        const dtoClass = plainToClass(this.updateDtoType, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Record<any, any>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(this.paramsDtoType, dtoObject);
        return await validate(dtoClass);
    }

    async getSortedAdvertIds(fieldId: string, advertIds: string[], direction: SortingType): Promise<string[]> {
        return advertIds;
    }

    // todo create some basic implementation
    abstract async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]>;
}
