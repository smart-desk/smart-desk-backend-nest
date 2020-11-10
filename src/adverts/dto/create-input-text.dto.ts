import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto } from './create-field-data-base.dto';

export class CreateInputTextDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
