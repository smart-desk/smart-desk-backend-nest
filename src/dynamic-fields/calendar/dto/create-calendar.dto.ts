import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';
import { Type } from 'class-transformer';
import { Column } from 'typeorm';

export class CreateCalendarDto extends DynamicFieldsBaseCreateDto {
    @IsBoolean()
    @IsOptional()
    range: boolean = false;

    @IsDate()
    @IsNotEmpty()
    date1: Date;

    @IsDate()
    @IsOptional()
    date2: Date;
}
