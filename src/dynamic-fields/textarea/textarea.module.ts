import { Module } from '@nestjs/common';
import { TextareaService } from './textarea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextareaEntity } from './textarea.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TextareaEntity])],
    providers: [TextareaService],
    exports: [TextareaService],
})
export class TextareaModule {}
