import { Injectable } from '@nestjs/common';
import { AbstractFieldService } from '../abstract-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PhotoEntity } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PhotoParamsDto } from './dto/photo-params.dto';

@Injectable()
export class PhotoService extends AbstractFieldService {
    constructor(@InjectRepository(PhotoEntity) private repository: Repository<PhotoEntity>) {
        super();
    }

    getRepository(): Repository<PhotoEntity> {
        return this.repository;
    }

    transformCreateObjectToClass(dtoObject: Partial<CreatePhotoDto>): CreatePhotoDto {
        return plainToClass(CreatePhotoDto, dtoObject);
    }

    async validateBeforeCreate(dtoObject: Partial<CreatePhotoDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    async validateAndCreate(dtoObject: Partial<CreatePhotoDto>): Promise<PhotoEntity> {
        const dtoClass = this.transformCreateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    transformUpdateObjectToClass(dtoObject: Partial<UpdatePhotoDto>): UpdatePhotoDto {
        return plainToClass(UpdatePhotoDto, dtoObject);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdatePhotoDto>): Promise<ValidationError[]> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<UpdatePhotoDto>): Promise<PhotoEntity> {
        const dtoClass = this.transformUpdateObjectToClass(dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateParams(dtoObject: Partial<PhotoParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(PhotoParamsDto, dtoObject);
        return await validate(dtoClass);
    }
}
