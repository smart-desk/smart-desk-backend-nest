import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories/categories.module';
import { FieldsModule } from './fields/fields.module';
import { ModelsModule } from './models/models.module';
import { SectionsModule } from './sections/sections.module';
import { UsersModule } from './users';
import { DataPipe } from './utils/data.pipe';

const app = [AuthModule, UsersModule, CategoriesModule, ModelsModule, SectionsModule, FieldsModule];

@Module({
    imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
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
