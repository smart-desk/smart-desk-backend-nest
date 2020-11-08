import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class TextareaCreateDto {
    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    value: string;
}
