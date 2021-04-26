import { IsBoolean, IsOptional } from 'class-validator';

export class CalendarParamsDto {
    @IsBoolean()
    @IsOptional()
    range: boolean = false;
}
