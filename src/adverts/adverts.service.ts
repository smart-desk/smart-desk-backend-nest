import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advert } from './advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto } from './advert.dto';

@Injectable()
export class AdvertsService {
    constructor(@InjectRepository(Advert) private advertRepository: Repository<Advert>) {}

    async getAll(options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        const skipped = (options.page - 1) * options.limit;

        const totalCount = await this.advertRepository.count();
        const adverts = await this.advertRepository
            .createQueryBuilder()
            .orderBy('created_at', 'DESC')
            .offset(skipped)
            .limit(options.limit)
            .getMany();

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
