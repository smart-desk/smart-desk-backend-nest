import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';
import { TextParamsDto } from './dto/text-params.dto';

@Injectable()
export class TextService extends BaseFieldService {
    constructor() {
        super(null, null, null);
    }

    getRepository(): Repository<DynamicFieldsBaseEntity> {
        return;
    }

    async validateBeforeCreate(dtoObject: Partial<any>): Promise<ValidationError[]> {
        return;
    }

    async validateAndCreate(dtoObject: Partial<any>): Promise<DynamicFieldsBaseEntity> {
        return;
    }

    async validateBeforeUpdate(dtoObject: Partial<any>): Promise<ValidationError[]> {
        return;
    }

    async validateAndUpdate(dtoObject: Partial<any>): Promise<DynamicFieldsBaseEntity> {
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
