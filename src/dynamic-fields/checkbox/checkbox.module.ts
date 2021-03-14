import { Module } from '@nestjs/common';
import { CheckboxService } from './checkbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckboxEntity } from './checkbox.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CheckboxEntity])],
    providers: [CheckboxService],
    exports: [CheckboxService],
})
export class CheckboxModule {}
