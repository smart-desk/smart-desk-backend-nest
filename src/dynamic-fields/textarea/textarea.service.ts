import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TextareaEntity } from './textarea.entity';
import { CreateTextareaDto } from './dto/create-textarea.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateTextareaDto } from './dto/update-textarea.dto';
import { TextareaParamsDto } from './dto/textarea-params.dto';

@Injectable()
export class TextareaService extends BaseFieldService {
    constructor(@InjectRepository(TextareaEntity) private repository: Repository<TextareaEntity>) {
        super();
    }

    getRepository(): Repository<TextareaEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreateTextareaDto>): CreateTextareaDto {
        return plainToClass(CreateTextareaDto, dtoObject);
    }

    async validateBeforeCreate(dtoObject: Partial<CreateTextareaDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndCreate(dtoObject: Partial<CreateTextareaDto>): Promise<TextareaEntity> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdateTextareaDto>): UpdateTextareaDto {
        return plainToClass(UpdateTextareaDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateTextareaDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdateTextareaDto>): Promise<TextareaEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<TextareaParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(TextareaParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
