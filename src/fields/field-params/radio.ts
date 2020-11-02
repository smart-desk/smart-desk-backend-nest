import { IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Radio {
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @Type(() => RadioItem)
    @ValidateNested()
    radios: RadioItem[];
}

export class RadioItem {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    label: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    value: string;
}
