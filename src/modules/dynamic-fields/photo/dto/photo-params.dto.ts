import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PhotoParamsDto {
    @IsOptional()
    @IsPositive()
    @Min(0)
    @Max(20)
    min = 1;

    @IsOptional()
    @IsPositive()
    @Min(1)
    @Max(50)
    max = 10;
}
