import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreateTextareaDto extends DynamicFieldsBaseCreateDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
