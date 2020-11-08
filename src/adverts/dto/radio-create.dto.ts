import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class RadioCreateDto {
    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
