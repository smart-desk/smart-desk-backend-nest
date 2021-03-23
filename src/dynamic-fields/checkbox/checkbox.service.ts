import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckboxEntity } from './checkbox.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCheckboxDto } from './dto/create-checkbox.dto';
import { UpdateCheckboxDto } from './dto/update-checkbox.dto';
import { CheckboxParamsDto } from './dto/checkbox-params.dto';
import { CheckboxFilterDto } from './dto/checkbox-filter.dto';

@Injectable()
export class CheckboxService extends BaseFieldService {
    constructor(@InjectRepository(CheckboxEntity) protected repository: Repository<CheckboxEntity>) {
        super(repository, CheckboxEntity, CreateCheckboxDto, UpdateCheckboxDto);
    }

    async validateParams(dtoObject: Partial<CheckboxParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(CheckboxParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: CheckboxFilterDto): Promise<string[]> {
        const result = await this.repository.createQueryBuilder('c').where('c.value && :params', { params }).getMany();

        return result.map(r => r.advert_id);
    }
}
