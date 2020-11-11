import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto, UpdateFieldDataBaseDto } from './field-data-base.dto';

export class CreateRadioDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}

export class UpdateRadioDto extends UpdateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
