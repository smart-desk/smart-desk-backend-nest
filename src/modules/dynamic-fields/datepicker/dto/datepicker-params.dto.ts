import { IsBoolean, IsOptional } from 'class-validator';

export class DatepickerParamsDto {
    @IsBoolean()
    @IsOptional()
    range: boolean = false;
}
