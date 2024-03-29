import { forwardRef, Module } from '@nestjs/common';
import { PromoController } from './promo.controller';
import { PromoSetController } from './promo-set.controller';
import { PromoService } from './promo.service';
import { PromoSetService } from './promo-set.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoSet } from './entities/promo-set.entity';
import { Promo } from './entities/promo.entity';
import { ProductsModule } from '../products/products.module';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PromoSet, Promo]),
        forwardRef(() => ProductsModule),
        forwardRef(() => StripeModule),
        forwardRef(() => UsersModule),
    ],
    controllers: [PromoController, PromoSetController],
    providers: [PromoService, PromoSetService],
    exports: [PromoService, PromoSetService],
})
export class PromoModule {}
