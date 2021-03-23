import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RadioEntity } from './radio.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRadioDto } from './dto/create-radio.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateRadioDto } from './dto/update-radio.dto';
import { RadioParamsDto } from './dto/radio-params.dto';
import { RadioFilterDto } from './dto/radio-filter.dto';

@Injectable()
export class RadioService extends BaseFieldService {
    constructor(@InjectRepository(RadioEntity) private repository: Repository<RadioEntity>) {
        super(RadioEntity, CreateRadioDto);
    }

    getRepository(): Repository<RadioEntity> {
        return this.repository;
    }

    async validateAndCreate(dtoObject: Partial<CreateRadioDto>): Promise<RadioEntity> {
        const dtoClass = plainToClass(CreateRadioDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(UpdateRadioDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<UpdateRadioDto>): Promise<RadioEntity> {
        const dtoClass = plainToClass(UpdateRadioDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<RadioParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(RadioParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: RadioFilterDto): Promise<string[]> {
        const result = await this.repository.find({
            where: {
                field_id: fieldId,
                value: In(params),
            },
        });

        return result.map(r => r.advert_id);
    }
}
