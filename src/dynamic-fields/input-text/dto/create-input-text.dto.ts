import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInputTextDto extends DynamicFieldsBaseCreateDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
