import { IsNumber, IsOptional } from 'class-validator';

export class AppConfigDto {
    @IsOptional()
    @IsNumber()
    adHourlyRate?: number;
}
