import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceEntity } from './price.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PriceEntity])],
    providers: [PriceService],
    exports: [PriceService],
})
export class PriceModule {}
