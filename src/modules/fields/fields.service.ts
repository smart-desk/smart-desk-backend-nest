import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { ValidationError } from 'class-validator';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { DynamicFieldsService } from '../dynamic-fields/dynamic-fields.service';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

@Injectable()
export class FieldsService {
    constructor(
        @InjectRepository(Field) private fieldRepository: Repository<Field>,
        private dynamicFieldsService: DynamicFieldsService
    ) {}

    async getById(id: string): Promise<Field> {
        return await this.findOneOrThrowException(id);
    }

    async create(fieldDto: FieldCreateDto): Promise<Field> {
        await this.sectionsService.getById(fieldDto.section_id);

        const errors = await this.validateParams(fieldDto, fieldDto.type);
        if (errors.length) {
            throw new BadRequestException(getMessageFromValidationErrors(errors));
        }

        const field = this.fieldRepository.create(fieldDto);
        return this.fieldRepository.save(field);
    }

    async update(id: string, fieldDto: FieldUpdateDto): Promise<Field> {
        const field = await this.findOneOrThrowException(id);
        await this.fieldRepository.update(field.id, fieldDto);

        const errors = await this.validateParams(fieldDto, field.type);
        if (errors.length) {
            throw new BadRequestException(getMessageFromValidationErrors(errors));
        }

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

    private validateParams(field: FieldCreateDto | FieldUpdateDto, type: FieldType): Promise<ValidationError[]> {
        const service = this.dynamicFieldsService.getService(type);
        if (!service) {
            return;
        }
        return service.validateParams(field.params);
    }
}
