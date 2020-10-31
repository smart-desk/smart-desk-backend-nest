import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './section.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Section])],
    providers: [SectionsService],
    controllers: [SectionsController],
})
export class SectionsModule {}
