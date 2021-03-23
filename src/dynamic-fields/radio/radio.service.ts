import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RadioEntity } from './radio.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRadioDto } from './dto/create-radio.dto';
import { UpdateRadioDto } from './dto/update-radio.dto';
import { RadioParamsDto } from './dto/radio-params.dto';
import { RadioFilterDto } from './dto/radio-filter.dto';

@Injectable()
export class RadioService extends BaseFieldService {
    constructor(@InjectRepository(RadioEntity) protected repository: Repository<RadioEntity>) {
        super(repository, RadioEntity, CreateRadioDto, UpdateRadioDto);
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
