import { IsNotEmpty, IsString } from 'class-validator';

export class TextDto {
    @IsNotEmpty()
    @IsString()
    value?: string;
}
