import { InputText, Text, Radio, Textarea } from './field-params';
import { FieldType } from './field.entity';
import { IsEnum, IsNotEmpty, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ParamClasses } from './constants';

export type FieldParamsType = InputText | Textarea | Text | Radio;

export class FieldCreateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @IsNotEmpty()
    @IsUUID()
    section_id: string;

    @Type(options => ParamClasses.get(options.object.type as FieldType))
    @ValidateNested()
    params?: FieldParamsType;
}
