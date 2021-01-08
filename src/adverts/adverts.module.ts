import { Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './entities/advert.entity';
import { SectionsModule } from '../sections/sections.module';
import { FieldsModule } from '../fields/fields.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';

@Module({
    imports: [TypeOrmModule.forFeature([Advert]), SectionsModule, FieldsModule, DynamicFieldsModule],
    providers: [AdvertsService],
    controllers: [AdvertsController],
    exports: [AdvertsService],
})
export class AdvertsModule {}
