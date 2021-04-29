import { IsNumber, IsPositive } from 'class-validator';
import { DynamicFieldsBaseUpdateDto } from '../../dynamic-fields-base-update.dto';

export class UpdatePriceDto extends DynamicFieldsBaseUpdateDto {
    @IsNumber()
    @IsPositive()
    value: number;
}
