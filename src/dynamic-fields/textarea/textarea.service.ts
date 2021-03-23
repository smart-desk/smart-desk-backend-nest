import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextareaEntity } from './textarea.entity';
import { CreateTextareaDto } from './dto/create-textarea.dto';
import { UpdateTextareaDto } from './dto/update-textarea.dto';
import { TextareaParamsDto } from './dto/textarea-params.dto';

@Injectable()
export class TextareaService extends BaseFieldService {
    constructor(@InjectRepository(TextareaEntity) protected repository: Repository<TextareaEntity>) {
        super(repository, TextareaEntity, CreateTextareaDto, UpdateTextareaDto, TextareaParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: any): Promise<string[]> {
        return null;
    }
}
