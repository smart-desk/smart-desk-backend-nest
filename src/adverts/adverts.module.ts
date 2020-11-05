import { Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './advert.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Advert])],
    providers: [AdvertsService],
    controllers: [AdvertsController],
})
export class AdvertsModule {}
