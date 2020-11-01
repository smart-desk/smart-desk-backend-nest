import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './field.entity';
import { SectionsModule } from '../sections/sections.module';

@Module({
    imports: [SectionsModule, TypeOrmModule.forFeature([Field])],
    controllers: [FieldsController],
    providers: [FieldsService],
})
export class FieldsModule {}
