import { Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './entities/advert.entity';
import { SectionsModule } from '../sections/sections.module';
import { TextareaEntity } from './entities/textarea.entity';
import { RadioEntity } from './entities/radio.entity';
import { InputTextEntity } from './entities/input-text.entity';
import { FieldsModule } from '../fields/fields.module';

@Module({
    imports: [TypeOrmModule.forFeature([Advert, InputTextEntity, TextareaEntity, RadioEntity]), SectionsModule, FieldsModule],
    providers: [AdvertsService],
    controllers: [AdvertsController],
})
export class AdvertsModule {}
