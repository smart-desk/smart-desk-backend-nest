import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FieldType } from '../fields/constants';
import { AbstractFieldService } from './abstract-field.service';

@Injectable()
export class DynamicFieldsService {
    constructor(private moduleRef: ModuleRef) {}

    getService(type: FieldType): AbstractFieldService {
        return this.moduleRef.get(type);
    }
}
