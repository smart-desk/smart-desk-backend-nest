import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ValidationError } from 'class-validator';
import { BaseFieldService } from '../base-field.service';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';
import { TextParamsDto } from './dto/text-params.dto';
import { DynamicFieldsBaseCreateDto } from '../dynamic-fields-base-create.dto';
import { DynamicFieldsBaseUpdateDto } from '../dynamic-fields-base-update.dto';

@Injectable()
export class TextService extends BaseFieldService {
    constructor() {
        super(null, null, null, null, TextParamsDto);
    }

    getRepository(): Repository<DynamicFieldsBaseEntity> {
        return;
    }

    async validateBeforeCreate(dtoObject: Partial<DynamicFieldsBaseCreateDto>): Promise<ValidationError[]> {
        return;
    }

    async validateAndCreate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity> {
        return;
    }

    async validateBeforeUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<ValidationError[]> {
        return;
    }

    async validateAndUpdate(dtoObject: Partial<DynamicFieldsBaseUpdateDto>): Promise<DynamicFieldsBaseEntity> {
        return;
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
