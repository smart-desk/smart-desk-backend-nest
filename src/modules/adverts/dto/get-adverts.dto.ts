import { IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { Advert } from '../entities/advert.entity';
import { AdvertStatus } from '../models/advert-status.enum';

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
    filters?: object; // todo define class or interface

    @IsUUID()
    @IsOptional()
    user?: string;

    @Exclude()
    status: AdvertStatus = AdvertStatus.ACTIVE;
}

export class GetAdvertsResponseDto {
    adverts: Advert[];
    totalCount: number;
    page: number;
    limit: number;
}
