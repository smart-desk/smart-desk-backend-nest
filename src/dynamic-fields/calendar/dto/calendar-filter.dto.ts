import { IsDate, IsOptional } from 'class-validator';

export class CalendarFilterDto {
    @IsDate()
    @IsOptional()
    from: Date;

    @IsDate()
    @IsOptional()
    to: Date;
}
