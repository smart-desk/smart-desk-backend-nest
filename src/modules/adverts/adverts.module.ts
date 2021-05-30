import { forwardRef, Module } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advert } from './entities/advert.entity';
import { FieldsModule } from '../fields/fields.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Advert]),
        FieldsModule,
        DynamicFieldsModule,
        forwardRef(() => UsersModule),
        forwardRef(() => MailModule),
    ],
    providers: [AdvertsService],
    controllers: [AdvertsController],
    exports: [AdvertsService],
})
export class AdvertsModule {}
