import { Module } from '@nestjs/common';
import { RadioService } from './radio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioEntity } from './radio.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RadioEntity])],
    providers: [RadioService],
    exports: [RadioService],
})
export class RadioModule {}
