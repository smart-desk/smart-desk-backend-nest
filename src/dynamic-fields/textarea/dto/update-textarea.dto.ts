import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UpdateFieldDataBaseDto } from '../../../adverts/dto/field-data-base.dto';

export class UpdateTextareaDto extends UpdateFieldDataBaseDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
