import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';
import { AdvertsModule } from '../adverts/adverts.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { FieldsModule } from '../fields/fields.module';
import { ModelsModule } from '../models/models.module';
import { SectionsModule } from '../sections/sections.module';
import { UsersModule } from '../users/users.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';
import { DataPipe } from '../utils/data.pipe';
import { S3Module } from '../s3/s3.module';
import { roles } from './app.roles';
import { BookmarksModule } from '../bookmarks/bookmarks.module';

const app = [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ModelsModule,
    SectionsModule,
    FieldsModule,
    AdvertsModule,
    DynamicFieldsModule,
    S3Module,
    BookmarksModule,
];

@Module({
    imports: [AccessControlModule.forRoles(roles), TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: DataPipe,
        },
    ],
    exports: [],
})
export class AppModule {}
