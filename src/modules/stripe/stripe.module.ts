import { forwardRef, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { AdModule } from '../ad/ad.module';
import { StripeService } from './stripe.service';

@Module({
    imports: [forwardRef(() => AdModule)],
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
