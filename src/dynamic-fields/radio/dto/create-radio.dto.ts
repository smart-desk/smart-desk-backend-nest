import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreateRadioDto extends DynamicFieldsBaseCreateDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
