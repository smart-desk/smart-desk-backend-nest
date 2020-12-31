import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { RadioEntity } from '../radio/radio.entity';
import { Repository } from 'typeorm';
import { CreateRadioDto } from '../radio/dto/create-radio.dto';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UpdateRadioDto } from '../radio/dto/update-radio.dto';
import { DynamicFieldsBaseCreateDto } from '../dynamic-fields-base-create.dto';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';
import { DynamicFieldsBaseUpdateDto } from '../dynamic-fields-base-update.dto';
import { TextParamsDto } from './dto/text-params.dto';

@Injectable()
export class TextService extends AbstractFieldService {
    constructor() {
        super();
    }

    getRepository(): Repository<RadioEntity> {
        return;
    }

    transformCreateObjectToClass(dtoObject: Partial<any>): DynamicFieldsBaseCreateDto {
        return;
    }

    async validateBeforeCreate(dtoObject: Partial<CreateRadioDto>): Promise<ValidationError[]> {
        return;
    }

    async validateAndCreate(dtoObject: Partial<CreateRadioDto>): Promise<DynamicFieldsBaseEntity> {
        return;
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdateRadioDto>): DynamicFieldsBaseUpdateDto {
        return;
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<ValidationError[]> {
        return;
    }

    async validateAndUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<DynamicFieldsBaseEntity> {
        return;
    }

    async validateParams(dtoObject: Partial<TextParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(TextParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
