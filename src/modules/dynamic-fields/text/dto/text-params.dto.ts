import { IsNotEmpty, IsString } from 'class-validator';

export class TextParamsDto {
    @IsNotEmpty()
    @IsString()
    value?: string;
}
