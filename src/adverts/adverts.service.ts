import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto } from './dto/advert.dto';
import { SectionsService } from '../sections/sections.service';
import { DataEntities } from './constants';
import { AdvertCreateDto } from './dto/advert-create.dto';

@Injectable()
export class AdvertsService {
    constructor(
        @InjectRepository(Advert) private advertRepository: Repository<Advert>,
        private sectionsService: SectionsService,
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
        const category = this.advertRepository.create(advertDto);
        return this.advertRepository.save(category);
    }

    private async loadFieldDataForAdvert(advert: Advert): Promise<Advert> {
        advert.sections = await this.sectionsService.getByModelId(advert.model_id);

        // todo sequential loading is not effective, replace with parallel
        for (const section of advert.sections) {
            for (const field of section.fields) {
                if (DataEntities.get(field.type)) {
                    field.data = await this.connection.manager.findOne(DataEntities.get(field.type), { field_id: field.id });
                }
            }
        }

        return advert;
    }
}
