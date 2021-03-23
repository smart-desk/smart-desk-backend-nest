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
    constructor(@InjectRepository(TextareaEntity) protected repository: Repository<TextareaEntity>) {
        super(repository, TextareaEntity, CreateTextareaDto);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateTextareaDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(UpdateTextareaDto, dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdateTextareaDto>): Promise<TextareaEntity> {
        const dtoClass = plainToClass(UpdateTextareaDto, dtoObject);
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
