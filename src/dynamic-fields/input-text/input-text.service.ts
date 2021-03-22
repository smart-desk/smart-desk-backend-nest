import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { InputTextEntity } from './input-text.entity';
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateInputTextDto } from './dto/update-input-text.dto';
import { InputTextParamsDto } from './dto/input-text-params.dto';

@Injectable()
export class InputTextService extends BaseFieldService {
    constructor(@InjectRepository(InputTextEntity) private repository: Repository<InputTextEntity>) {
        super();
    }

    getRepository(): Repository<InputTextEntity> {
        return this.repository;
    }

    async validateBeforeCreate(dtoObject: Partial<CreateInputTextDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(CreateInputTextDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndCreate(dtoObject: Partial<CreateInputTextDto>): Promise<InputTextEntity> {
        const dtoClass = this.transformObjectToClass<InputTextEntity>(InputTextEntity, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateBeforeUpdate(updateDtoObject: Partial<UpdateInputTextDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformObjectToClass(UpdateInputTextDto, updateDtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdateInputTextDto>): Promise<InputTextEntity> {
        const dtoClass = this.transformObjectToClass(UpdateInputTextDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<InputTextParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(InputTextParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
