import { Advert } from './advert.entity';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class AdvertsGetDto {
    @IsOptional()
    @IsPositive()
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @IsPositive()
    @IsNumber()
    limit?: number = 20;
}

export class AdvertsGetResponseDto {
    adverts: Advert[];
    totalCount: number;
    page: number;
    limit: number;
}
