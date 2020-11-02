import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class Textarea {
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
}
