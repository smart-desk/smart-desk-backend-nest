import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories/categories.module';
import { FieldsModule } from './fields/fields.module';
import { ModelsModule } from './models/models.module';
import { SectionsModule } from './sections/sections.module';
import { UsersModule } from './users';
import { AdvertsModule } from './adverts/adverts.module';
import { DynamicFieldsModule } from './dynamic-fields/dynamic-fields.module';

const app = [AuthModule, UsersModule, CategoriesModule, ModelsModule, SectionsModule, FieldsModule, AdvertsModule, DynamicFieldsModule];

@Module({
    imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {}
