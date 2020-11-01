import { InputText, Text, Radio, Textarea } from './field-params';
import { FieldType } from './field.entity';
import { IsEnum, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class FieldCreateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @IsNotEmpty()
    @IsUUID()
    section_id: string;

    params: InputText | Textarea | Text | Radio | null;
}
