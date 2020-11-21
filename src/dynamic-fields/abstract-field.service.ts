import { Repository } from 'typeorm';
import { ValidationError } from 'class-validator';

export abstract class AbstractFieldService {
    // todo abstract class for field entity
    abstract getRepository(): Repository<any>;

    // todo some abstract class
    abstract transformCreateObjectToClass(createDtoObject: Record<string, any>): any;

    // todo base field
    abstract validateBeforeCreate(createDtoObject: Record<string, any>): Promise<ValidationError[]>;

    // todo return entity
    abstract validateAndCreate(createDtoObject: Record<string, any>): Promise<any>;

    // todo some abstract class
    abstract transformUpdateObjectToClass(updateDtoObject: Record<string, any>): any;

    // todo base field
    abstract validateBeforeUpdate(updateDtoObject: Record<string, any>): Promise<ValidationError[]>;

    // todo return entity
    abstract validateAndUpdate(updateDtoObject: Record<string, any>): Promise<any>;
}
