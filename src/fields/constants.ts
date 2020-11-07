import { InputText, Radio, Text, Textarea } from './field-params';

export enum FieldType {
    INPUT_TEXT = 'input_text',
    TEXTAREA = 'textarea',
    TEXT = 'text',
    RADIO = 'radio',
}

export const ParamClasses: Map<FieldType, any> = new Map()
    .set(FieldType.INPUT_TEXT, InputText)
    .set(FieldType.TEXT, Text)
    .set(FieldType.RADIO, Radio)
    .set(FieldType.TEXTAREA, Textarea);
