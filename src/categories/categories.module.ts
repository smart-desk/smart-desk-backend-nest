import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';

@Module({
    controllers: [CategoriesController],
    providers: [],
})
export class CategoriesModule {}