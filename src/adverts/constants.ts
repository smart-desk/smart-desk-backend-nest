import { FieldType } from '../fields/constants';
import { RadioEntity } from './entities/radio.entity';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';
import { CreateInputTextDto, UpdateInputTextDto } from './dto/input-text.dto';
import { CreateRadioDto, UpdateRadioDto } from './dto/radio.dto';
import { CreateTextareaDto, UpdateTextareaDto } from './dto/textarea.dto';

// todo think how to get rid of any
export const CreateFieldDataDtoTypes: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, CreateInputTextDto)
    .set(FieldType.RADIO, CreateRadioDto)
    .set(FieldType.TEXTAREA, CreateTextareaDto);

export const UpdateFieldDataDtoTypes: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, UpdateInputTextDto)
    .set(FieldType.RADIO, UpdateRadioDto)
    .set(FieldType.TEXTAREA, UpdateTextareaDto);

export const FieldDataEntities: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
