import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsModule } from './models/models.module';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories';
import { UsersModule } from './users';

const app = [AuthModule, UsersModule, CategoriesModule, ModelsModule];

@Module({
    imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), ...app],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {
}