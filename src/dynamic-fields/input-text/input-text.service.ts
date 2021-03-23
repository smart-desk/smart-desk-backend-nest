import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { InputTextEntity } from './input-text.entity';
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { UpdateInputTextDto } from './dto/update-input-text.dto';
import { InputTextParamsDto } from './dto/input-text-params.dto';

@Injectable()
export class InputTextService extends BaseFieldService {
    constructor(@InjectRepository(InputTextEntity) protected repository: Repository<InputTextEntity>) {
        super(repository, InputTextEntity, CreateInputTextDto, UpdateInputTextDto);
    }

    async validateParams(dtoObject: Partial<InputTextParamsDto>): Promise<ValidationError[]> {
        const dtoClass = plainToClass(InputTextParamsDto, dtoObject);
        return await validate(dtoClass);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
