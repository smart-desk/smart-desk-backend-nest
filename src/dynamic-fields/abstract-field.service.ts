import { Repository } from 'typeorm';
import { ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';
import { DynamicFieldsBaseEntity } from './dynamic-fields-base.entity';

export abstract class AbstractFieldService {
    abstract getRepository(): Repository<DynamicFieldsBaseEntity>;

    abstract transformCreateObjectToClass(dtoObject: Partial<DynamicFieldsBaseCreateDto>): DynamicFieldsBaseCreateDto;

    abstract validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]>;

    abstract validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;

    abstract transformUpdateObjectToClass(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): DynamicFieldsBaseUpdateDto;

    abstract validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]>;

    abstract validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity>;
}
