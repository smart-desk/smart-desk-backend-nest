import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10000) // todo: уточнить, объем памяти для ячейки.
    content: string;
}
