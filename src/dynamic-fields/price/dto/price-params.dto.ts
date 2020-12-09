import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class PriceParamsDto {
    @IsNotEmpty()
    @MaxLength(10)
    @IsString()
    currency: string;
}
