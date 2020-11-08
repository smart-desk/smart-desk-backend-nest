import { IsNotEmpty, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { AdvertFieldsDto } from '../constants';

export class AdvertCreateDto {
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

    @ValidateNested()
    fields: AdvertFieldsDto[];
}
