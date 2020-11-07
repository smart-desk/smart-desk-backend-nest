import { Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './advert.entity';
import { SectionsModule } from '../sections/sections.module';
import { TextareaEntity } from './field-data-entities/textarea.entity';
import { RadioEntity } from './field-data-entities/radio.entity';
import { InputTextEntity } from './field-data-entities/input-text.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Advert, InputTextEntity, TextareaEntity, RadioEntity]), SectionsModule],
    providers: [AdvertsService],
    controllers: [AdvertsController],
})
export class AdvertsModule {}
