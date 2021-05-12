import { IsDate, IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';

export class DatepickerFilterDto {
    @IsDate()
    @IsOptional()
    from: Date;

    @IsDate()
    @IsOptional()
    to: Date;

    @IsDate()
    @IsOptional()
    range: boolean = false;
}
