import { IsArray, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields/dynamic-fields-base-create.dto';

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
