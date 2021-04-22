import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdateCalendarDto extends DynamicFieldsBaseUpdateDto {
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
