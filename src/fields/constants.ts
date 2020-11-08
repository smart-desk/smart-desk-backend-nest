import { InputTextDto } from './dto/input-text.dto';
import { TextDto } from './dto/text.dto';
import { RadioDto } from './dto/radio.dto';
import { TextareaDto } from './dto/textarea.dto';

export enum FieldType {
    INPUT_TEXT = 'input_text',
    TEXTAREA = 'textarea',
    TEXT = 'text',
    RADIO = 'radio',
}

export const FieldParamDto: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextDto)
    .set(FieldType.TEXT, TextDto)
    .set(FieldType.RADIO, RadioDto)
    .set(FieldType.TEXTAREA, TextareaDto);
