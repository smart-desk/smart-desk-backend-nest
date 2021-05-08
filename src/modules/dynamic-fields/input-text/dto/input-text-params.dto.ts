import { IsOptional, MaxLength } from 'class-validator';

export class InputTextParamsDto {
    @IsOptional()
    @MaxLength(255)
    placeholder?: string;
}
