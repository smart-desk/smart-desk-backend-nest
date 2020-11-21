import { Repository } from 'typeorm';
import { ValidationError } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from './dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from './dynamic-fields-base-update.dto';

export abstract class AbstractFieldService {
    // todo abstract class for field entity
    abstract getRepository(): Repository<any>;

    // todo some abstract class
    abstract transformCreateObjectToClass(dtoObject: Partial<DynamicFieldsBaseCreateDto>): DynamicFieldsBaseCreateDto;

    // todo base field
    abstract validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]>;

    // todo return entity
    abstract validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<any>;

    // todo some abstract class
    abstract transformUpdateObjectToClass(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): DynamicFieldsBaseUpdateDto;

    // todo base field
    abstract validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]>;

    // todo return entity
    abstract validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<any>;
}
