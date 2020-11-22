import { Module } from '@nestjs/common';
import { DynamicFieldsService } from './dynamic-fields.service';
import { InputTextModule } from './input-text/input-text.module';
import { InputTextService } from './input-text/input-text.service';
import { TextareaModule } from './textarea/textarea.module';
import { TextareaService } from './textarea/textarea.service';
import { RadioModule } from './radio/radio.module';
import { RadioService } from './radio/radio.service';
import { TextModule } from './text/text.module';
import { TextService } from './text/text.service';
import { PhotoService } from './photo/photo.service';
import { PhotoModule } from './photo/photo.module';

export enum FieldType {
    INPUT_TEXT = 'input_text',
    TEXTAREA = 'textarea',
    TEXT = 'text',
    RADIO = 'radio',
    PHOTO = 'photo',
}

@Module({
    providers: [
        DynamicFieldsService,
        {
            provide: FieldType.INPUT_TEXT,
            useExisting: InputTextService,
        },
        {
            provide: FieldType.TEXTAREA,
            useExisting: TextareaService,
        },
        {
            provide: FieldType.RADIO,
            useExisting: RadioService,
        },
        {
            provide: FieldType.TEXT,
            useExisting: TextService,
        },
        {
            provide: FieldType.PHOTO,
            useExisting: PhotoService,
        },
    ],
    imports: [InputTextModule, TextareaModule, RadioModule, TextModule, PhotoModule],
    exports: [DynamicFieldsService],
})
export class DynamicFieldsModule {}
