import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
        if (options.filters) {
            return await this.getAdvertsWithFilters(options);
        }
        return this.getAdverts(options);
    }

    async getForCategory(categoryId: string, options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        if (options.filters) {
            return await this.getAdvertsWithFilters(options, categoryId);
        }
        return this.getAdverts(options, categoryId);
    }

    async getById(id: string): Promise<Advert> {
        const advert = await this.findOneOrThrowException(id);
        return this.loadFieldDataForAdvert(advert);
    }

    async create(userId: string, advertDto: CreateAdvertDto): Promise<Advert> {
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

        const advert = this.advertRepository.create({ ...advertDto, userId });
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

            const errors = fieldDataObject.id
                ? await service.validateBeforeUpdate(fieldDataObject)
                : await service.validateBeforeCreate(fieldDataObject);

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

            if (fieldData.dto.id) {
                await service.validateAndUpdate(fieldData.dto);
            } else {
                fieldData.dto.advert_id = id;
                await service.validateAndCreate(fieldData.dto);
            }
        }

        return this.getById(advertResult.id);
    }

    async delete(id: string): Promise<Advert> {
        const advert = await this.findOneOrThrowException(id);
        return this.advertRepository.remove(advert);
    }

    async getAdvertOwner(id: string): Promise<string> {
        const advert = await this.getById(id);
        return advert.userId;
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
                if (repository) {
                    field.data = await repository.findOne({
                        where: {
                            field_id: field.id,
                            advert_id: advert.id,
                        },
                    });
                }
            }
        }

        return advert;
    }

    private async getAdverts(options: AdvertsGetDto, categoryId?: string): Promise<AdvertsGetResponseDto> {
        const where: any = {};
        if (categoryId) {
            where.category_id = categoryId;
        }

        const [adverts, totalCount] = await this.advertRepository.findAndCount({
            where,
            order: {
                createdAt: 'DESC',
            },
            skip: (options.page - 1) * options.limit,
            take: options.limit,
        });

        const advertsWithData = await Promise.all<Advert>(adverts.map(advert => this.loadFieldDataForAdvert(advert)));
        const advertResponse = new AdvertsGetResponseDto();

        advertResponse.totalCount = totalCount;
        advertResponse.adverts = advertsWithData;
        advertResponse.page = options.page;
        advertResponse.limit = options.limit;

        return advertResponse;
    }

    private async getAdvertsWithFilters(options: AdvertsGetDto, categoryId?: string): Promise<AdvertsGetResponseDto> {
        const { filters } = options;
        if (typeof filters !== 'object') {
            throw new BadRequestException('Invalid filters format');
        }

        let advertIds: string[];
        for (let [fieldId, params] of Object.entries(filters)) {
            try {
                const field = await this.fieldsService.getById(fieldId);
                const service = this.dynamicFieldsService.getService(field.type);
                if (!service) {
                    continue;
                }

                const filteredAdvertIds = await service.getAdvertIdsByFilter(fieldId, params);
                if (!filteredAdvertIds) {
                    continue;
                }

                // find intersection to exclude already filtered adverts
                advertIds = advertIds ? advertIds.filter(id => filteredAdvertIds.includes(id)) : filteredAdvertIds;
            } catch (e) {
                // skip filter if field id is not correct
                continue;
            }
        }

        let adverts: Advert[] = [];
        let totalCount: number = 0;
        if (advertIds && advertIds.length) {
            const where: any = { id: In(advertIds) };
            if (categoryId) {
                where.category_id = categoryId;
            }

            [adverts, totalCount] = await this.advertRepository.findAndCount({
                where,
                order: {
                    createdAt: 'DESC',
                },
                skip: (options.page - 1) * options.limit,
                take: options.limit,
            });
        }

        const advertsWithData = await Promise.all<Advert>(adverts.map(advert => this.loadFieldDataForAdvert(advert)));
        const advertResponse = new AdvertsGetResponseDto();

        advertResponse.totalCount = totalCount;
        advertResponse.adverts = advertsWithData;
        advertResponse.page = options.page;
        advertResponse.limit = options.limit;

        return advertResponse;
    }
}
