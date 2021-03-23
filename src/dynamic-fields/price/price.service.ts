import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PriceEntity } from './price.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PriceParamsDto } from './dto/price-params.dto';
import { PriceFilterDto } from './dto/price-filter.dto';

@Injectable()
export class PriceService extends BaseFieldService {
    constructor(@InjectRepository(PriceEntity) protected repository: Repository<PriceEntity>) {
        super(repository, PriceEntity, CreatePriceDto, UpdatePriceDto);
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
