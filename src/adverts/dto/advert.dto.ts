import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields/dynamic-fields-base-create.dto';
import { Transform } from 'class-transformer';
import { Advert } from '../entities/advert.entity';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields/dynamic-fields-base-update.dto';

export class CreateAdvertDto {
    @IsUUID()
    @IsNotEmpty()
    category_id: string;

    @IsUUID()
    @IsNotEmpty()
    model_id: string;

    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsArray()
    fields: DynamicFieldsBaseCreateDto[];
}

export class UpdateAdvertDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsArray()
    fields: DynamicFieldsBaseUpdateDto[];
}

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
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsUUID()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string = '';
}

export class AdvertsGetResponseDto {
    adverts: Advert[];
    totalCount: number;
    page: number;
    limit: number;
}
