import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { FieldType } from '../../dynamic-fields/dynamic-fields.module';

export class FieldCreateDto {
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsUUID()
    modelId: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @IsNotEmpty()
    // @IsEnum(SectionType) // todo
    section: string;

    @IsOptional()
    @IsInt()
    order?: number;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    params?: unknown;
}

export class FieldUpdateDto {
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsInt()
    order?: number;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    params?: unknown;
}
