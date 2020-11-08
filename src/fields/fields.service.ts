import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { SectionsService } from '../sections/sections.service';

@Injectable()
export class FieldsService {
    constructor(@InjectRepository(Field) private fieldRepository: Repository<Field>, private sectionsService: SectionsService) {}

    async create(fieldDto: FieldCreateDto): Promise<Field> {
        await this.sectionsService.getById(fieldDto.section_id);

        const field = this.fieldRepository.create(fieldDto);
        return this.fieldRepository.save(field);
    }

    async update(id: string, fieldDto: FieldUpdateDto): Promise<Field> {
        const field = await this.fieldRepository.findOne({ id });
        if (!field) {
            throw new NotFoundException('Field not found');
        }

        await this.fieldRepository.update(field.id, fieldDto);

        return this.fieldRepository.findOne(field.id);
    }

    async delete(id: string): Promise<DeleteResult> {
        const field = await this.fieldRepository.findOne({ id });
        if (!field) {
            throw new NotFoundException('Field not found');
        }

        return this.fieldRepository.delete(field.id);
    }
}
