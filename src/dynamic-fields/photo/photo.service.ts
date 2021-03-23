import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
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
export class PhotoService extends BaseFieldService {
    constructor(@InjectRepository(PhotoEntity) private repository: Repository<PhotoEntity>) {
        super(PhotoEntity, CreatePhotoDto);
    }

    getRepository(): Repository<PhotoEntity> {
        return this.repository;
    }

    async validateAndCreate(dtoObject: Partial<CreatePhotoDto>): Promise<PhotoEntity> {
        const dtoClass = plainToClass(CreatePhotoDto, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateBeforeUpdate(dtoObject: Partial<UpdatePhotoDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(UpdatePhotoDto, dtoObject);
        return await validate(dtoClass);
    }

    async validateAndUpdate(dtoObject: Partial<UpdatePhotoDto>): Promise<PhotoEntity> {
        const dtoClass = plainToClass(UpdatePhotoDto, dtoObject);
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

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
