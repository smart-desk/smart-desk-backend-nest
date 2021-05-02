import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoEntity } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PhotoParamsDto } from './dto/photo-params.dto';

@Injectable()
export class PhotoService extends BaseFieldService {
    constructor(@InjectRepository(PhotoEntity) protected repository: Repository<PhotoEntity>) {
        super(repository, PhotoEntity, CreatePhotoDto, UpdatePhotoDto, PhotoParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
