import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advert } from './advert.entity';

@Injectable()
export class AdvertsService {
    constructor(@InjectRepository(Advert) private advertRepository: Repository<Advert>) {}

    // todo pagination
    getAll(): Promise<Advert[]> {
        return this.advertRepository.find();
    }

    async getById(id: string): Promise<Advert> {
        const advert = await this.advertRepository.findOne({ id });
        if (!advert) {
            throw new NotFoundException('Advert not found');
        }
        return advert;
    }
}
