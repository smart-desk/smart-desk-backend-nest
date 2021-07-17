import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { PromoSet } from './entities/promo-set.entity';
import { PromoSetDto } from './dto/promo-set.dto';

@Injectable()
export class PromoSetService {
    constructor(@InjectRepository(PromoSet) private promoSetRepository: Repository<PromoSet>) {}

    async getList(): Promise<PromoSet[]> {
        return await this.promoSetRepository.find();
    }

    async getById(id: string): Promise<PromoSet> {
        return await this.findOneOrThrowException(id);
    }

    async create(promoSetDto: PromoSetDto): Promise<PromoSet> {
        const promoSet = this.promoSetRepository.create(promoSetDto);
        return this.promoSetRepository.save(promoSet);
    }

    async update(id: string, promoSetDto: PromoSetDto): Promise<PromoSet> {
        const promoSet = await this.findOneOrThrowException(id);
        await this.promoSetRepository.update(promoSet.id, promoSetDto);
        return this.promoSetRepository.findOne({ id: promoSet.id });
    }

    async delete(id: string): Promise<DeleteResult> {
        const promoSet = await this.findOneOrThrowException(id);
        return this.promoSetRepository.delete(promoSet.id);
    }

    private async findOneOrThrowException(id: string): Promise<PromoSet> {
        const promoSet = await this.promoSetRepository.findOne({ id });
        if (!promoSet) {
            throw new NotFoundException(`Promo Set ${id} not found`);
        }
        return promoSet;
    }
}
