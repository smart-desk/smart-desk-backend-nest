import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto, UpdateFieldDataBaseDto } from './field-data-base.dto';

export class CreateTextareaDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}

export class UpdateTextareaDto extends UpdateFieldDataBaseDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
