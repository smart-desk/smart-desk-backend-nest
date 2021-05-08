import { IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class TextareaParamsDto {
    @IsOptional()
    @MaxLength(255)
    placeholder?: string;

    @IsOptional()
    @IsBoolean()
    richTextEditor?: boolean;
}
