import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioEntity } from './radio.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRadioDto } from './dto/create-radio.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateRadioDto } from './dto/update-radio.dto';
import { RadioParamsDto } from './dto/radio-params.dto';

@Injectable()
export class RadioService extends AbstractFieldService {
    constructor(@InjectRepository(RadioEntity) private repository: Repository<RadioEntity>) {
        super();
    }

    getRepository(): Repository<RadioEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreateRadioDto>): CreateRadioDto {
        return plainToClass(CreateRadioDto, dtoObject);
    }

    async validateBeforeCreate(dtoObject: Partial<CreateRadioDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(CreateRadioDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndCreate(dtoObject: Partial<CreateRadioDto>): Promise<RadioEntity> {
        const dtoClass = plainToClass(CreateRadioDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdateRadioDto>): UpdateRadioDto {
        return plainToClass(UpdateRadioDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<RadioEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<RadioParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(RadioParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilterParams(fieldId: string, params: any): Promise<Set<string>> {
        return null;
    }
}
