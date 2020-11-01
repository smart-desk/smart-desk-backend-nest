import { IsArray, IsNotEmpty, MaxLength } from 'class-validator';

export class Radio {
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsNotEmpty()
    @IsArray()
    radios: RadioItem[];
}

export class RadioItem {
    @IsNotEmpty()
    label: string;

    @IsNotEmpty()
    value: string;
}
