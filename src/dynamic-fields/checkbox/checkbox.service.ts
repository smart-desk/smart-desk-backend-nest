import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, In, Repository } from 'typeorm';
import { CheckboxEntity } from './checkbox.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCheckboxDto } from './dto/create-checkbox.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateCheckboxDto } from './dto/update-checkbox.dto';
import { CheckboxParamsDto } from './dto/checkbox-params.dto';
import { CheckboxFilterDto } from './dto/checkbox-filter.dto';

@Injectable()
export class CheckboxService extends BaseFieldService {
    constructor(@InjectRepository(CheckboxEntity) private repository: Repository<CheckboxEntity>) {
        super();
    }

    getRepository(): Repository<CheckboxEntity> {
        return this.repository;
    }

    async validateBeforeCreate(dtoObject: Partial<CreateCheckboxDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(CreateCheckboxDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndCreate(dtoObject: Partial<CreateCheckboxDto>): Promise<CheckboxEntity> {
        const dtoClass = plainToClass(CreateCheckboxDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateCheckboxDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformObjectToClass(UpdateCheckboxDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<UpdateCheckboxDto>): Promise<CheckboxEntity> {
        const dtoClass = this.transformObjectToClass(UpdateCheckboxDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<CheckboxParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(CheckboxParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: CheckboxFilterDto): Promise<string[]> {
        const result = await this.repository.createQueryBuilder('c').where('c.value && :params', { params }).getMany();

        return result.map(r => r.advert_id);
    }
}
