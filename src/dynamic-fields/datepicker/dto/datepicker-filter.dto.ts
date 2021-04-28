import { IsDate, IsOptional } from 'class-validator';

export class DatepickerFilterDto {
    @IsDate()
    @IsOptional()
    from: Date;

    @IsDate()
    @IsOptional()
    to: Date;
}
