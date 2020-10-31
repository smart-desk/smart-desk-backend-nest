import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';

@Module({
    providers: [SectionsService],
    controllers: [SectionsController],
})
export class SectionsModule {}
