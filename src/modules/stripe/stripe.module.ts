import { forwardRef, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { AdModule } from '../ad/ad.module';
import { StripeService } from './stripe.service';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [forwardRef(() => AdModule), forwardRef(() => ProductsModule)],
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
