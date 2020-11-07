import { FieldType } from '../fields/constants';
import { RadioEntity } from './field-data-entities/radio.entity';
import { InputTextEntity } from './field-data-entities/input-text.entity';
import { TextareaEntity } from './field-data-entities/textarea.entity';

export const DataEntities: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
