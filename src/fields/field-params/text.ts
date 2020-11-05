import { IsNotEmpty, IsString } from 'class-validator';

export class Text {
    @IsNotEmpty()
    @IsString()
    value?: string;
}
