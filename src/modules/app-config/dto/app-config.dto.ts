import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AppConfigDto {
    @IsString()
    @MaxLength(1000)
    @IsOptional()
    logo?: string;
}
