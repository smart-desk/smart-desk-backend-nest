import { Module } from '@nestjs/common';
import { DatepickerService } from './datepicker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatepickerEntity } from './datepicker.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DatepickerEntity])],
    providers: [DatepickerService],
    exports: [DatepickerService],
})
export class DatepickerModule {}
