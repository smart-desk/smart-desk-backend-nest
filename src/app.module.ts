import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot(), AuthModule, UsersModule, CategoriesModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {
}