import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto } from '../../../adverts/dto/field-data-base.dto';

export class CreateTextareaDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
