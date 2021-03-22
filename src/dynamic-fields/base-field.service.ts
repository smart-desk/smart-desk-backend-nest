import { Repository } from 'typeorm';
import { ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';
import { DynamicFieldsBaseEntity } from './dynamic-fields-base.entity';

export abstract class BaseFieldService {
    abstract getRepository(): Repository<DynamicFieldsBaseEntity>;

    abstract validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]>;

    abstract validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]>;

    abstract validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract validateParams(dtoObject: Record<any, any>): Promise<ValidationError[]>;

    abstract async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]>;
}
