import { Module } from '@nestjs/common';
import { InputTextService } from './input-text.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InputTextEntity } from './input-text.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InputTextEntity])],
    providers: [InputTextService],
    exports: [InputTextService],
})
export class InputTextModule {}
