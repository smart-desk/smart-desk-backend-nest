import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { AdModule } from '../ad/ad.module';

@Module({
    imports: [AdModule],
    controllers: [StripeController],
})
export class StripeModule {}
