import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoEntity } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PhotoParamsDto } from './dto/photo-params.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { getMessageFromValidationErrors } from '../../../utils/validation';
import { S3Service } from '../../s3/s3.service';

@Injectable()
export class PhotoService extends BaseFieldService {
    constructor(@InjectRepository(PhotoEntity) protected repository: Repository<PhotoEntity>, private s3Service: S3Service) {
        super(repository, PhotoEntity, CreatePhotoDto, UpdatePhotoDto, PhotoParamsDto);
    }

    async validateAndCreate(dtoObject: Partial<CreatePhotoDto>): Promise<PhotoEntity> {
        await Promise.all(dtoObject.value.map(value => this.s3Service.moveImageToPublic(value)));
        dtoObject.value = dtoObject.value.map(value => value.replace('temp', 'public'));
        const dtoClass = plainToClass(this.createDtoType, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async validateAndUpdate(dtoObject: Partial<UpdatePhotoDto>): Promise<PhotoEntity> {
        await Promise.all(dtoObject.value.filter(value => value.startsWith('temp')).map(value => this.s3Service.moveImageToPublic(value)));
        dtoObject.value = dtoObject.value.map(value => value.replace('temp', 'public'));
        const dtoClass = plainToClass(this.updateDtoType, dtoObject);
        const errors = await validate(dtoClass);
        if (errors.length) {
            throw getMessageFromValidationErrors(errors);
        }

        const instance = this.repository.create(dtoClass);
        return this.repository.save(instance);
    }

    async getProductIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
