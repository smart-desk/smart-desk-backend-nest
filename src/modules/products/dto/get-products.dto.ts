import { IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../models/product-status.enum';
import { Sorting } from '../models/sorting';
import { Filters } from '../models/filters';

export class GetProductsDto {
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

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsObject()
    @IsOptional()
    sorting?: Sorting;
}

export class GetProductsResponseDto {
    products: Product[];
    totalCount: number;
    page: number;
    limit: number;
}
