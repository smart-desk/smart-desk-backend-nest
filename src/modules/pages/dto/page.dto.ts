import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10000)
    content: string;
}
