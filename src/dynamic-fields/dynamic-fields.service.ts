import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AbstractFieldService } from './abstract-field.service';
import { FieldType } from './dynamic-fields.module';

@Injectable()
export class DynamicFieldsService {
    constructor(private moduleRef: ModuleRef) {}

    getService(type: FieldType): AbstractFieldService {
        return this.moduleRef.get(type);
    }
}
