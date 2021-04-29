import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './field.entity';
import { SectionsModule } from '../sections/sections.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';

@Module({
    imports: [SectionsModule, TypeOrmModule.forFeature([Field]), DynamicFieldsModule],
    controllers: [FieldsController],
    providers: [FieldsService],
    exports: [FieldsService],
})
export class FieldsModule {}
