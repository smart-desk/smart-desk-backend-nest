import { IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class Textarea {
    @IsNotEmpty()
    @MaxLength(255)
    label: string;

    @MaxLength(255)
    placeholder?: string;

    @IsBoolean()
    required?: boolean;
}
