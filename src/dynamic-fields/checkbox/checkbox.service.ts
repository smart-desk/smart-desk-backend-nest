import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CheckboxEntity } from './checkbox.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCheckboxDto } from './dto/create-checkbox.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateCheckboxDto } from './dto/update-checkbox.dto';
import { CheckboxParamsDto } from './dto/checkbox-params.dto';
import { CheckboxFilterDto } from './dto/checkbox-filter.dto';

@Injectable()
export class CheckboxService extends AbstractFieldService {
    constructor(@InjectRepository(CheckboxEntity) private repository: Repository<CheckboxEntity>) {
        super();
    }

    getRepository(): Repository<CheckboxEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreateCheckboxDto>): CreateCheckboxDto {
        return plainToClass(CreateCheckboxDto, dtoObject);
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

    transformUpdateObjectToClass(dtoObject: Partial<UpdateCheckboxDto>): UpdateCheckboxDto {
        return plainToClass(UpdateCheckboxDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateCheckboxDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<UpdateCheckboxDto>): Promise<CheckboxEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
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
        const result = await this.repository.find({
            where: {
                field_id: fieldId,
                value: In(params),
            },
        });

        return result.map(r => r.advert_id);
    }
}