import { Module } from '@nestjs/common';
import { PromoController } from './promo.controller';
import { PromoSetController } from './promo-set.controller';
import { PromoService } from './promo.service';
import { PromoSetService } from './promo-set.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoSet } from './entities/promo-set.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PromoSet])],
    controllers: [PromoController, PromoSetController],
    providers: [PromoService, PromoSetService],
})
export class PromoModule {}
