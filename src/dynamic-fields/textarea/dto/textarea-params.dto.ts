import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class TextareaParamsDto {
    @IsNotEmpty()
    @MaxLength(255)
    @IsString()
    label: string;

    @IsOptional()
    @MaxLength(255)
    placeholder?: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @IsOptional()
    @IsBoolean()
    richTextEditor?: boolean;
}
