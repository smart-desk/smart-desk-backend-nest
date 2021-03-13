import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdateCheckboxDto extends DynamicFieldsBaseUpdateDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
