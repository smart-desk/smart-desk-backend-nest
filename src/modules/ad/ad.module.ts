import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';

@Module({
    imports: [TypeOrmModule.forFeature([AdConfig])],
    controllers: [AdController],
    providers: [AdService],
    exports: [AdService],
})
export class AdModule {}
