import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PromoSetDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsNotEmpty()
    @IsInt()
    days: number;

    @IsNotEmpty()
    @IsInt()
    price: number;
}
