import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreatePhotoDto extends DynamicFieldsBaseCreateDto {
    @IsNotEmpty()
    @IsArray()
    @MaxLength(1000, { each: true })
    @IsString({ each: true })
    value: string[];
}
