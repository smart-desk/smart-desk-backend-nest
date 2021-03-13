import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreateCheckboxDto extends DynamicFieldsBaseCreateDto {
    @IsString({ each: true })
    @MaxLength(255, { each: true })
    @IsNotEmpty({ each: true })
    value: string[];
}
