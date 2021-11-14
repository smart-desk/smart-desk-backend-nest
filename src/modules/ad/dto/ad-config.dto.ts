import { Contains, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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

    @IsString()
    @MaxLength(1000)
    @Contains('adsbygoogle.js')
    @IsOptional()
    adsense?: string;
}
