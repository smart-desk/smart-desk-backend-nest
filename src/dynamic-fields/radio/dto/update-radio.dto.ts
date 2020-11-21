import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UpdateFieldDataBaseDto } from '../../../adverts/dto/field-data-base.dto';

export class UpdateRadioDto extends UpdateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
