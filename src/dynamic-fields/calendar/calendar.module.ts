import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEntity } from './calendar.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CalendarEntity])],
    providers: [CalendarService],
    exports: [CalendarService],
})
export class CalendarModule {}
