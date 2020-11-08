import { FieldType } from '../fields/constants';
import { RadioEntity } from './entities/radio.entity';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';
import { InputTextCreateDto } from './dto/input-text-create.dto';
import { RadioCreateDto } from './dto/radio-create.dto';
import { TextareaCreateDto } from './dto/textarea-create.dto';

export type FieldDataCreateDtoType = InputTextCreateDto | RadioCreateDto | TextareaCreateDto;

export const FieldDataCreateDto: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextCreateDto)
    .set(FieldType.RADIO, RadioCreateDto)
    .set(FieldType.TEXTAREA, TextareaCreateDto);

export type FieldDataEntityType = InputTextEntity | RadioEntity | TextareaEntity;

export const FieldDataEntities: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
