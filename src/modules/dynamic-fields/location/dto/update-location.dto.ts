import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdateLocationDto extends DynamicFieldsBaseUpdateDto {
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
