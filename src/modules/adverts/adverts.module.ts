import { forwardRef, Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './entities/advert.entity';
import { FieldsModule } from '../fields/fields.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Advert]), FieldsModule, DynamicFieldsModule, forwardRef(() => UsersModule)],
    providers: [AdvertsService],
    controllers: [AdvertsController],
    exports: [AdvertsService],
})
export class AdvertsModule {}