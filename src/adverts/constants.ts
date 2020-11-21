import { FieldType } from '../fields/constants';
import { RadioEntity } from '../dynamic-fields/radio/radio.entity';
import { InputTextEntity } from '../dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../dynamic-fields/textarea/textarea.entity';
import { CreateInputTextDto } from '../dynamic-fields/input-text/dto/create-input-text.dto';
import { UpdateInputTextDto } from '../dynamic-fields/input-text/dto/update-input-text.dto';
import { CreateRadioDto } from '../dynamic-fields/radio/dto/create-radio.dto';
import { UpdateRadioDto } from '../dynamic-fields/radio/dto/update-radio.dto';
import { UpdateTextareaDto } from '../dynamic-fields/textarea/dto/update-textarea.dto';
import { Type } from '@nestjs/common';
import { CreateTextareaDto } from '../dynamic-fields/textarea/dto/create-textarea.dto';

export type CreateFieldDataDto = CreateInputTextDto | CreateRadioDto | CreateTextareaDto;
export type UpdateFieldDataDto = UpdateInputTextDto | UpdateRadioDto | UpdateTextareaDto;
export type FieldDataEntity = InputTextEntity | RadioEntity | TextareaEntity;

export const CreateFieldDataDtoTypes: Map<FieldType, Type<CreateFieldDataDto>> = new Map()
    .set(FieldType.INPUT_TEXT, CreateInputTextDto)
    .set(FieldType.RADIO, CreateRadioDto)
    .set(FieldType.TEXTAREA, CreateTextareaDto);

export const UpdateFieldDataDtoTypes: Map<FieldType, Type<UpdateFieldDataDto>> = new Map()
    .set(FieldType.INPUT_TEXT, UpdateInputTextDto)
    .set(FieldType.RADIO, UpdateRadioDto)
    .set(FieldType.TEXTAREA, UpdateTextareaDto);

export const FieldDataEntities: Map<FieldType, Type<FieldDataEntity>> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
