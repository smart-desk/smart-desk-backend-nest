import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateFieldDataBaseDto, UpdateFieldDataBaseDto } from './field-data-base.dto';

export class CreateInputTextDto extends CreateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}

export class UpdateInputTextDto extends UpdateFieldDataBaseDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
