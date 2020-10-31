import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories/categories.module';
import { ModelsModule } from './models/models.module';
import { UsersModule } from './users';

const app = [AuthModule, UsersModule, ModelsModule, CategoriesModule];

@Module({
    imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule {}
