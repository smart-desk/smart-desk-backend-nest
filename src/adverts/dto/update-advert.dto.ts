import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields/dynamic-fields-base-update.dto';

export class UpdateAdvertDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsArray()
    fields: DynamicFieldsBaseUpdateDto[];
}