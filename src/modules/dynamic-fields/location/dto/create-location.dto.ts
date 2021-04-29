import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreateLocationDto extends DynamicFieldsBaseCreateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}
