import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdateCheckboxDto extends DynamicFieldsBaseUpdateDto {
    @IsString({ each: true })
    @MaxLength(255, { each: true })
    @IsNotEmpty({ each: true })
    value: string[];
}
