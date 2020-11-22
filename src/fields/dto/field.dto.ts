import { IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { FieldType } from '../../dynamic-fields/dynamic-fields.module';

export class FieldCreateDto {
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @IsNotEmpty()
    @IsUUID()
    section_id: string;

    params?: unknown;
}

export class FieldUpdateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    params?: unknown;
}
