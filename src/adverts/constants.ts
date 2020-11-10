import { FieldType } from '../fields/constants';
import { RadioEntity } from './entities/radio.entity';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { CreateRadioDto } from './dto/create-radio.dto';
import { CreateTextareaDto } from './dto/create-textarea.dto';

// todo think how to get rid of any
export const CreateFieldDataDtoTypes: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, CreateInputTextDto)
    .set(FieldType.RADIO, CreateRadioDto)
    .set(FieldType.TEXTAREA, CreateTextareaDto);

export type FieldDataEntityType = InputTextEntity | RadioEntity | TextareaEntity;

export const FieldDataEntities: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
