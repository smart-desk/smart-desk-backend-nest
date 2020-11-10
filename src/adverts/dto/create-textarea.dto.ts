import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto } from './create-field-data-base.dto';

export class CreateTextareaDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
