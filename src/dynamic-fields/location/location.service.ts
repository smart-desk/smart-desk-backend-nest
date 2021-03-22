import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LocationEntity } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationParamsDto } from './dto/location-params.dto';
import { LocationFilterDto } from './dto/location-filter.dto';

@Injectable()
export class LocationService extends BaseFieldService {
    constructor(@InjectRepository(LocationEntity) private repository: Repository<LocationEntity>) {
        super();
    }

    getRepository(): Repository<LocationEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreateLocationDto>): CreateLocationDto {
        return plainToClass(CreateLocationDto, dtoObject);
    }

    async validateBeforeCreate(dtoObject: Partial<CreateLocationDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndCreate(dtoObject: Partial<CreateLocationDto>): Promise<LocationEntity> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdateLocationDto>): UpdateLocationDto {
        return plainToClass(UpdateLocationDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdateLocationDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    // todo think one more time about api, maybe return { error, instance }
    async validateAndUpdate(dtoObject: Partial<UpdateLocationDto>): Promise<LocationEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<LocationParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(LocationParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: LocationFilterDto): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder()
            .where({
                field_id: fieldId,
            })
            .getMany();

        return result.filter(field => this.withinRadius(field, params)).map(r => r.advert_id);
    }

    private withinRadius(field: LocationEntity, params: LocationFilterDto): boolean {
        const R = 6371;
        const deg2rad = n => Math.tan(n * (Math.PI / 180));

        let dLat = deg2rad(params.lat - field.lat);
        let dLon = deg2rad(params.lng - field.lng);

        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(field.lat)) * Math.cos(deg2rad(params.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.asin(Math.sqrt(a));
        let d = R * c;

        return d <= (params.radius || 9999999999);
    }
}
