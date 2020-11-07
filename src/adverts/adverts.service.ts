import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Advert } from './advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto } from './advert.dto';
import { SectionsService } from '../sections/sections.service';
import { DataEntities } from './constants';

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

        for (const advert of adverts) {
            advert.sections = await this.sectionsService.getByModelId(advert.model_id);

            for (const section of advert.sections) {
                for (const field of section.fields) {
                    if (DataEntities.get(field.type)) {
                        field.data = await this.connection.manager.findOne(DataEntities.get(field.type), { field_id: field.id });
                    }
                }
            }
        }

        const totalCount = await query.getCount();

        const response = new AdvertsGetResponseDto();
        response.adverts = adverts;
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
        return advert;
    }
}
