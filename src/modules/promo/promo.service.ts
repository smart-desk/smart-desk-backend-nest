import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promo } from './entities/promo.entity';
import { CreatePromoDto } from './dto/create-promo.dto';

@Injectable()
export class PromoService {
    constructor(@InjectRepository(Promo) private promoRepository: Repository<Promo>) {}

    async createPromo(promo: CreatePromoDto): Promise<Promo> {
        return this.promoRepository.create(promo);
    }
}
