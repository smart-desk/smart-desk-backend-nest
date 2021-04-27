import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields/dynamic-fields-base-create.dto';
import { PreferContact } from '../models/prefer-contact.enum';

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

    @IsOptional()
    @IsEnum(PreferContact)
    preferContact?: PreferContact;
}
