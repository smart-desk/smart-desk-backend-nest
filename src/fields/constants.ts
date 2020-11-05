import { FieldType } from './field.entity';
import { InputText, Radio, Text, Textarea } from './field-params';

export const ParamClasses: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputText)
    .set(FieldType.TEXT, Text)
    .set(FieldType.RADIO, Radio)
    .set(FieldType.TEXTAREA, Textarea);
