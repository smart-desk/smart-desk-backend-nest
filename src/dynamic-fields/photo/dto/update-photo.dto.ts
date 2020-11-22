import { IsArray, IsNotEmpty, IsString, Max } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdatePhotoDto extends DynamicFieldsBaseUpdateDto {
    @IsNotEmpty()
    @IsArray()
    @Max(1000, { each: true })
    @IsString({ each: true })
    value: string[];
}
