import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto, UpdateAdvertDto } from './dto/advert.dto';
import { SectionsService } from '../sections/sections.service';
import { CreateAdvertDto } from './dto/advert.dto';
import { FieldsService } from '../fields/fields.service';
import { getMessageFromValidationErrors } from '../utils/validation';
import { DynamicFieldsService } from '../dynamic-fields/dynamic-fields.service';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

interface FieldDataDtoInstance {
    type: FieldType;
    dto: any; // todo not any
}

@Injectable()
export class AdvertsService {
    constructor(
        @InjectRepository(Advert) private advertRepository: Repository<Advert>,
        private sectionsService: SectionsService,
        private fieldsService: FieldsService,
        private dynamicFieldsService: DynamicFieldsService
    ) {}

    async getAll(options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        const skipped = (options.page - 1) * options.limit;

        const query = await this.advertRepository
            .createQueryBuilder('advert')
            .andWhere(options.category_id ? 'advert.category_id = :category_id' : '1=1', { category_id: options.category_id })
            .andWhere(options.search ? 'LOWER(advert.title COLLATE "en_US") LIKE :search' : '1=1', {
                search: options.search ? `%${options.search.toLocaleLowerCase()}%` : '',
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
        const advert = await this.findOneOrThrowException(id);
        return this.loadFieldDataForAdvert(advert);
    }

    async create(advertDto: CreateAdvertDto): Promise<Advert> {
        // todo (future) check that model belongs to category
        // todo (future) check that field belongs to model
        // todo (future) check that field_id is unique for this advert
        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of advertDto.fields) {
            if (!isUUID(fieldDataObject.field_id)) {
                throw new BadRequestException('field_id must be an UUID');
            }

            const field = await this.fieldsService.getById(fieldDataObject.field_id);
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }

            const errors = await service.validateBeforeCreate(fieldDataObject);
            if (errors.length) {
                throw new BadRequestException(getMessageFromValidationErrors(errors));
            }

            validDtos.push({
                type: field.type,
                dto: fieldDataObject,
            });
        }

        const advert = this.advertRepository.create(advertDto);
        const advertResult = await this.advertRepository.save(advert);

        for (const fieldData of validDtos) {
            const service = this.dynamicFieldsService.getService(fieldData.type);
            if (!service) {
                continue;
            }
            fieldData.dto.advert_id = advertResult.id;
            await service.validateAndCreate(fieldData.dto);
        }

        return this.getById(advertResult.id);
    }

    async update(id: string, advertDto: UpdateAdvertDto): Promise<Advert> {
        await this.findOneOrThrowException(id);

        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of advertDto.fields) {
            if (!isUUID(fieldDataObject.field_id)) {
                throw new BadRequestException('field_id must be an UUID');
            }

            const field = await this.fieldsService.getById(fieldDataObject.field_id);
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }

            const errors = await service.validateBeforeUpdate(fieldDataObject);
            if (errors.length) {
                throw new BadRequestException(getMessageFromValidationErrors(errors));
            }

            validDtos.push({
                type: field.type,
                dto: fieldDataObject,
            });
        }

        const updatedAdvert = await this.advertRepository.preload({ id, ...advertDto });
        const advertResult = await this.advertRepository.save(updatedAdvert);

        for (const fieldData of validDtos) {
            const service = this.dynamicFieldsService.getService(fieldData.type);
            if (!service) {
                continue;
            }
            await service.validateAndUpdate(fieldData.dto);
        }

        return this.getById(advertResult.id);
    }

    async delete(id: string): Promise<Advert> {
        const advert = await this.findOneOrThrowException(id);
        return this.advertRepository.remove(advert);
    }

    private async findOneOrThrowException(id: string): Promise<Advert> {
        const advert = await this.advertRepository.findOne({ id });
        if (!advert) {
            throw new NotFoundException(`Advert ${id} not found`);
        }
        return advert;
    }

    private async loadFieldDataForAdvert(advert: Advert): Promise<Advert> {
        advert.sections = await this.sectionsService.getByModelId(advert.model_id);

        // todo sequential loading is not effective, replace with parallel
        for (const section of advert.sections) {
            for (const field of section.fields) {
                const service = this.dynamicFieldsService.getService(field.type);
                if (!service) {
                    continue;
                }
                const repository = service.getRepository();
                field.data = await repository.findOne({ where: { field_id: field.id } });
            }
        }

        return advert;
    }
}
