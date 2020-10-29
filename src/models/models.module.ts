import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './model.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Model])],
    controllers: [ModelsController],
    providers: [ModelsService],
})
export class ModelsModule {}
