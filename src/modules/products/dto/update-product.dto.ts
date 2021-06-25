import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields/dynamic-fields-base-update.dto';
import { PreferContact } from '../models/prefer-contact.enum';

export class UpdateProductDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsArray()
    fields: DynamicFieldsBaseUpdateDto[];

    @IsOptional()
    @IsEnum(PreferContact)
    preferContact?: PreferContact;
}
