import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories/categories.module';
import { FieldsModule } from './fields/fields.module';
import { ModelsModule } from './models/models.module';
import { SectionsModule } from './sections/sections.module';
import { UsersModule } from './users';

const app = [AuthModule, UsersModule, CategoriesModule, ModelsModule, SectionsModule, FieldsModule];

@Module({
    imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {}
