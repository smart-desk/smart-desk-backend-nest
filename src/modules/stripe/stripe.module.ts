import { forwardRef, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { AdModule } from '../ad/ad.module';
import { StripeService } from './stripe.service';
import { ProductsModule } from '../products/products.module';
import { PromoModule } from '../promo/promo.module';

@Module({
    imports: [forwardRef(() => AdModule), forwardRef(() => ProductsModule), forwardRef(() => PromoModule)],
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
