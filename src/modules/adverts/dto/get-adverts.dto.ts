import { IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { Advert } from '../entities/advert.entity';
import { AdvertStatus } from '../models/advert-status.enum';
import { Sorting } from '../models/sorting';
import { Filters } from '../models/filters';

export class GetAdvertsDto {
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Transform(page => parseInt(page), { toClassOnly: true })
    page?: number = 1;

    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Transform(limit => parseInt(limit), { toClassOnly: true })
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string = '';

    @IsObject()
    @IsOptional()
    filters?: Filters;

    @IsUUID()
    @IsOptional()
    user?: string;

    @Exclude()
    status: AdvertStatus = AdvertStatus.ACTIVE;

    @IsObject()
    @IsOptional()
    sorting?: Sorting;
}

export class GetAdvertsResponseDto {
    adverts: Advert[];
    totalCount: number;
    page: number;
    limit: number;
}
