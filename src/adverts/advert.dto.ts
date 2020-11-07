import { Advert } from './advert.entity';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdvertsGetDto {
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Transform(page => parseInt(page), { toClassOnly: true })
    page?: number = 1;

    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Transform(limit => parseInt(limit), { toClassOnly: true })
    limit?: number = 20;

    @IsOptional()
    @IsUUID()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string;
}

export class AdvertsGetResponseDto {
    adverts: Advert[];
    totalCount: number;
    page: number;
    limit: number;
}
