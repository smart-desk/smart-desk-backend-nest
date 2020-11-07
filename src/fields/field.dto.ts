import { InputText, Text, Radio, Textarea } from './field-params';
import { IsEnum, IsNotEmpty, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, ParamClasses } from './constants';

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

export class FieldUpdateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @Type(options => ParamClasses.get(options.object.type as FieldType))
    @ValidateNested()
    params?: FieldParamsType;
}
