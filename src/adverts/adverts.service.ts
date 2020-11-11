import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto, UpdateAdvertDto } from './dto/advert.dto';
import { SectionsService } from '../sections/sections.service';
import { CreateFieldDataDtoTypes, FieldDataEntities, UpdateFieldDataDtoTypes } from './constants';
import { CreateAdvertDto } from './dto/advert.dto';
import { FieldsService } from '../fields/fields.service';
import { FieldType } from '../fields/constants';
import { getMessageFromValidationErrors } from '../utils/validation';

@Injectable()
export class AdvertsService {
    constructor(
        @InjectRepository(Advert) private advertRepository: Repository<Advert>,
        private sectionsService: SectionsService,
        private fieldsService: FieldsService,
        private connection: Connection
    ) {}

    async getAll(options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        const skipped = (options.page - 1) * options.limit;

        const query = await this.advertRepository
            .createQueryBuilder('')
            .andWhere(options.category_id ? 'advert.category_id = :category_id' : '1=1', { category_id: options.category_id })
            .andWhere(options.search ? 'LOWER(title COLLATE "en_US") LIKE :search' : '1=1', {
                search: `%${options.search.toLocaleLowerCase()}%`,
            });

        const adverts = await query.orderBy('created_at', 'DESC').offset(skipped).limit(options.limit).getMany();
        const totalCount = await query.getCount();
        const resolvedAdverts = await Promise.all(adverts.map(advert => this.loadFieldDataForAdvert(advert)));

        const response = new AdvertsGetResponseDto();
        response.adverts = resolvedAdverts;
        response.page = options.page;
        response.limit = options.limit;
        response.totalCount = totalCount;

        return response;
    }

    async getById(id: string): Promise<Advert> {
        const advert = await this.advertRepository.findOne({ id });
        if (!advert) {
            throw new NotFoundException('Advert not found');
        }

        return this.loadFieldDataForAdvert(advert);
    }

    async create(advertDto: CreateAdvertDto): Promise<Advert> {
        // todo (future) check that model belongs to category
        // todo (future) check that field belongs to model
        const validFieldsData: Array<{ fieldType: FieldType; data: any }> = [];
        for (const dataObject of advertDto.fields) {
            const field = await this.fieldsService.getById(dataObject.field_id);
            const dataType = CreateFieldDataDtoTypes.get(field.type);

            if (dataType) {
                const dataClass = plainToClass(dataType, { ...dataObject });
                const validationErrors = await validate(dataClass);
                if (validationErrors.length) {
                    throw new BadRequestException(getMessageFromValidationErrors(validationErrors));
                }

                validFieldsData.push({
                    fieldType: field.type,
                    data: dataClass,
                });
            }
        }

        const advert = this.advertRepository.create(advertDto);
        const advertResult = await this.advertRepository.save(advert);

        for (const fieldData of validFieldsData) {
            const targetClass = FieldDataEntities.get(fieldData.fieldType);
            fieldData.data.advert_id = advertResult.id;

            const fieldDataEntity = this.connection.manager.create(targetClass, fieldData.data);
            await this.connection.manager.save(fieldDataEntity);
        }

        return this.getById(advertResult.id);
    }

    async update(id: string, advertDto: UpdateAdvertDto): Promise<Advert> {
        const advert = await this.advertRepository.findOne({ id });
        if (!advert) {
            throw new NotFoundException('Advert not found');
        }

        const validFieldsData: Array<{ fieldType: FieldType; data: any }> = [];
        for (const dataObject of advertDto.fields) {
            const field = await this.fieldsService.getById(dataObject.field_id);
            const dataType = UpdateFieldDataDtoTypes.get(field.type);

            // todo reuse
            if (dataType) {
                const dataClass = plainToClass(dataType, { ...dataObject });
                const validationErrors = await validate(dataClass);
                if (validationErrors.length) {
                    throw new BadRequestException(getMessageFromValidationErrors(validationErrors));
                }

                validFieldsData.push({
                    fieldType: field.type,
                    data: dataClass,
                });
            }
        }

        const updatedAdvert = await this.advertRepository.preload({ id, ...advertDto });
        const advertResult = await this.advertRepository.save(updatedAdvert);

        for (const fieldData of validFieldsData) {
            const targetClass = FieldDataEntities.get(fieldData.fieldType);

            const fieldDataEntity = this.connection.manager.preload(targetClass, fieldData.data);
            await this.connection.manager.save(fieldDataEntity);
        }

        return this.getById(advertResult.id);
    }

    private async loadFieldDataForAdvert(advert: Advert): Promise<Advert> {
        advert.sections = await this.sectionsService.getByModelId(advert.model_id);

        // todo sequential loading is not effective, replace with parallel
        for (const section of advert.sections) {
            for (const field of section.fields) {
                if (FieldDataEntities.get(field.type)) {
                    field.data = await this.connection.manager.findOne(FieldDataEntities.get(field.type), { field_id: field.id });
                }
            }
        }

        return advert;
    }
}
