import { CreateFieldDataBaseDto } from '../../../adverts/dto/field-data-base.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInputTextDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
