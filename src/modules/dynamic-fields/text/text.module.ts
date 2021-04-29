import { Module } from '@nestjs/common';
import { TextService } from './text.service';

@Module({
    providers: [TextService],
    exports: [TextService],
})
export class TextModule {}
