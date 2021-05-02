import { IsArray, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';
import { IsImageUrl } from '../../../../utils/validation';

export class UpdatePhotoDto extends DynamicFieldsBaseUpdateDto {
    @IsNotEmpty()
    @IsArray()
    @MaxLength(1000, { each: true })
    @IsString({ each: true })
    @IsUrl({}, { each: true })
    @IsImageUrl({ each: true })
    value: string[];
}
