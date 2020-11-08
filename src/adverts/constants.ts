import { FieldType } from '../fields/constants';
import { RadioEntity } from './entities/radio.entity';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';

export const DataEntities: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputTextEntity)
    .set(FieldType.RADIO, RadioEntity)
    .set(FieldType.TEXTAREA, TextareaEntity);
