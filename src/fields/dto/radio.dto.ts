import { IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RadioDto {
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
