import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';
import { Type } from 'class-transformer';

export class UpdateDatepickerDto extends DynamicFieldsBaseUpdateDto {
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    date1: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date2: Date;
}
