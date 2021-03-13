import { IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckboxParamsDto {
    @Type(() => CheckboxItem)
    @ValidateNested()
    checkboxes: CheckboxItem[];
}

export class CheckboxItem {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    label: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    value: string;
}
