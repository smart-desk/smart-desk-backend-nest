import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BaseFieldService } from './base-field.service';
import { FieldType } from './dynamic-fields.module';

@Injectable()
export class DynamicFieldsService {
    constructor(private moduleRef: ModuleRef) {}

    getService(type: FieldType): BaseFieldService {
        return this.moduleRef.get(type);
    }
}
