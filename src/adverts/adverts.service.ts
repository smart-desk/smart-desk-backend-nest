import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto } from './dto/advert-get.dto';
import { SectionsService } from '../sections/sections.service';
import { FieldDataCreateDto, FieldDataEntities, FieldDataEntityType } from './constants';
import { AdvertCreateDto } from './dto/advert-create.dto';
import { plainToClass } from 'class-transformer';
import { FieldsService } from '../fields/fields.service';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { validate } from 'class-validator';

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

    async create(advertDto: AdvertCreateDto): Promise<Advert> {
        // todo validate fields before creating
        const advert = this.advertRepository.create(advertDto);
        const advertResult = await this.advertRepository.save(advert);

        for (const fieldDto of advertDto.fields) {
            const field = await this.fieldsService.getById(fieldDto.field_id);
            const targetDto = FieldDataCreateDto.get(field.type);
            const targetClass = FieldDataEntities.get(field.type);

            if (targetDto) {
                const createDtoClass = plainToClass(targetDto, { ...fieldDto });
                try {
                    await validate(createDtoClass);
                } catch (e) {
                    throw new BadRequestException(e);
                }

                (createDtoClass as any).advert_id = advertResult.id; // todo no any
                const fieldData = this.connection.manager.create(targetClass as EntityTarget<FieldDataEntityType>, createDtoClass);
                await this.connection.manager.save(fieldData);
            }
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
