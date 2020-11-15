import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { SectionsService } from '../sections/sections.service';

@Injectable()
export class FieldsService {
    constructor(@InjectRepository(Field) private fieldRepository: Repository<Field>, private sectionsService: SectionsService) {}

    async getById(id: string): Promise<Field> {
        return await this.findOneOrThrowException(id);
    }

    async create(fieldDto: FieldCreateDto): Promise<Field> {
        await this.sectionsService.getById(fieldDto.section_id);

        const field = this.fieldRepository.create(fieldDto);
        return this.fieldRepository.save(field);
    }

    async update(id: string, fieldDto: FieldUpdateDto): Promise<Field> {
        const field = await this.findOneOrThrowException(id);
        await this.fieldRepository.update(field.id, fieldDto);

        return this.fieldRepository.findOne({ id: field.id });
    }

    async delete(id: string): Promise<DeleteResult> {
        const field = await this.findOneOrThrowException(id);
        return this.fieldRepository.delete(field.id);
    }

    private async findOneOrThrowException(id: string): Promise<Field> {
        const field = await this.fieldRepository.findOne({ id });
        if (!field) {
            // todo error message 'Field ${id} not found'
            throw new NotFoundException('Field not found');
        }
        return field;
    }
}
