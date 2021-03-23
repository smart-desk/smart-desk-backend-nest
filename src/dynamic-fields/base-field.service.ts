import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';
import { DynamicFieldsBaseEntity } from './dynamic-fields-base.entity';
import { Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

export abstract class BaseFieldService {
    constructor(private entityType: Type<any>, private createDtoType: Type<any>) {}

    abstract getRepository(): Repository<DynamicFieldsBaseEntity>;

    async validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(this.createDtoType, dtoObject);
        return await validate(dtoClass);
    }

    abstract validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]>;

    abstract validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract validateParams(dtoObject: Record<any, any>): Promise<ValidationError[]>;

    abstract async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]>;
}
