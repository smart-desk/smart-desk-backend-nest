import { IsNumber, IsOptional } from 'class-validator';

export class AdConfigDto {
    @IsOptional()
    @IsNumber()
    mainHourlyRate?: number;

    @IsOptional()
    @IsNumber()
    sidebarHourlyRate?: number;

    @IsOptional()
    @IsNumber()
    liftRate?: number;
}
