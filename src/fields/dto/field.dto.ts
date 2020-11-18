import { IsEnum, IsNotEmpty, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, FieldParamDto } from '../constants';
import { InputTextDto } from './input-text.dto';
import { TextareaDto } from './textarea.dto';
import { TextDto } from './text.dto';
import { RadioDto } from './radio.dto';

export type FieldParamsType = InputTextDto | TextareaDto | TextDto | RadioDto;

export class FieldCreateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @IsNotEmpty()
    @IsUUID()
    section_id: string;

    @Type(options => FieldParamDto.get(options.object.type as FieldType))
    @ValidateNested()
    params?: FieldParamsType;
}

export class FieldUpdateDto {
    @MaxLength(255)
    title?: string;

    @IsNotEmpty()
    @IsEnum(FieldType)
    type: FieldType;

    @Type(options => FieldParamDto.get(options.object.type as FieldType))
    @ValidateNested()
    params?: FieldParamsType;
}
