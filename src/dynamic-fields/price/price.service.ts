import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PriceEntity } from './price.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PriceParamsDto } from './dto/price-params.dto';
import { PriceFilterDto } from './dto/price-filter.dto';

@Injectable()
export class PriceService extends BaseFieldService {
    constructor(@InjectRepository(PriceEntity) private repository: Repository<PriceEntity>) {
        super();
    }

    getRepository(): Repository<PriceEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreatePriceDto>): CreatePriceDto {
        return plainToClass(CreatePriceDto, dtoObject);
    }

    async validateBeforeCreate(dtoObject: Partial<CreatePriceDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndCreate(dtoObject: Partial<CreatePriceDto>): Promise<PriceEntity> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdatePriceDto>): UpdatePriceDto {
        return plainToClass(UpdatePriceDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdatePriceDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdatePriceDto>): Promise<PriceEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<PriceParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(PriceParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: PriceFilterDto): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder()
            .where({
                field_id: fieldId,
                value: Between(params.from || 0, params.to || 9999999999999),
            })
            .getMany();

        return result.map(r => r.advert_id);
    }
}
