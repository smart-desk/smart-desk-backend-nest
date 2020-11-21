import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './model.entity';
import { SectionsModule } from '../sections/sections.module';

@Module({
    imports: [TypeOrmModule.forFeature([Model]), SectionsModule],
    controllers: [ModelsController],
    providers: [ModelsService],
})
export class ModelsModule {}
