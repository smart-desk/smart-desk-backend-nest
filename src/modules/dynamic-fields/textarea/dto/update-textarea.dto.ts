import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdateTextareaDto extends DynamicFieldsBaseUpdateDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
