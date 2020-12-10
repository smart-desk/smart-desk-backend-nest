import { IsNumber, IsPositive } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';

export class CreatePriceDto extends DynamicFieldsBaseCreateDto {
    @IsNumber()
    @IsPositive()
    value: number;
}
