import { IsNumber, IsPositive } from 'class-validator';
import { DynamicFieldsBaseCreateDto } from '../../dynamic-fields-base-create.dto';
import { Type } from 'class-transformer';

export class CreatePriceDto extends DynamicFieldsBaseCreateDto {
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    value: number;
}
