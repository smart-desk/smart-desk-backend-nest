import { IsArray, IsNotEmpty, IsString, IsUrl, Max, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';
import { IsImageUrl } from '../../../utils/validation';

export class CreatePhotoDto extends DynamicFieldsBaseCreateDto {
    @IsNotEmpty()
    @IsArray()
    @MaxLength(1000, { each: true })
    @IsString({ each: true })
    @IsUrl({}, { each: true })
    @IsImageUrl({ each: true })
    value: string[];
}
