import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { FieldsModule } from '../fields/fields.module';
import { ModelsModule } from '../models/models.module';
import { UsersModule } from '../users/users.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';
import { DataPipe } from '../../utils/data.pipe';
import { S3Module } from '../s3/s3.module';
import { roles } from './app.roles';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { PhoneModule } from '../phone/phone.module';
import { ChatModule } from '../chat/chat.module';
import { MailModule } from '../mail/mail.module';
import { AdModule } from '../ad/ad.module';
import { StripeModule } from '../stripe/stripe.module';
import { RawBodyMiddleware } from '../../middlewares/raw-body.middleware';
import { StripeController } from '../stripe/stripe.controller';
import { ParsedBodyMiddleware } from '../../middlewares/parsed-body.middleware';
import { PromoModule } from '../promo/promo.module';
import { PagesModule } from '../pages/pages.module';

const app = [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ModelsModule,
    FieldsModule,
    ProductsModule,
    DynamicFieldsModule,
    S3Module,
    BookmarksModule,
    PhoneModule,
    ChatModule,
    MailModule,
    AdModule,
    StripeModule,
    PromoModule,
    PagesModule,
];

@Module({
    imports: [AccessControlModule.forRoles(roles), TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    providers: [
        {
            provide: APP_PIPE,
            useClass: DataPipe,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RawBodyMiddleware).forRoutes(StripeController).apply(ParsedBodyMiddleware).forRoutes('*');
    }
}
