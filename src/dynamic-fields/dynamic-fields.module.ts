import { Module } from '@nestjs/common';
import { DynamicFieldsService } from './dynamic-fields.service';
import { InputTextModule } from './input-text/input-text.module';
import { FieldType } from '../fields/constants';
import { InputTextService } from './input-text/input-text.service';
import { TextareaModule } from './textarea/textarea.module';
import { TextareaService } from './textarea/textarea.service';
import { RadioModule } from './radio/radio.module';
import { RadioService } from './radio/radio.service';

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
    ],
    imports: [InputTextModule, TextareaModule, RadioModule],
    exports: [DynamicFieldsService],
})
export class DynamicFieldsModule {}
