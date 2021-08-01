import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promo, PromoStatus } from './entities/promo.entity';
import { CreatePromoDto } from './dto/create-promo.dto';

@Injectable()
export class PromoService {
    constructor(@InjectRepository(Promo) private promoRepository: Repository<Promo>) {}

    async createPromo(promoDto: CreatePromoDto): Promise<Promo> {
        const promo = this.promoRepository.create(promoDto);
        return await this.promoRepository.save(promo);
    }

    async getPromosByCategory(categoryId: string): Promise<Promo[]> {
        return await this.promoRepository
            .createQueryBuilder('promo')
            .leftJoin('promo.product', 'product')
            .where('promo.status=:status', { status: PromoStatus.ACTIVE })
            .andWhere('promo.startDate < now()')
            .andWhere('now() < promo.endDate')
            .andWhere('product.category_id=:category', { category: categoryId })
            .getMany();
    }
}
