import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEntity } from './calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarParamsDto } from './dto/calendar-params.dto';
import { CalendarFilterDto } from './dto/calendar-filter.dto';

@Injectable()
export class CalendarService extends BaseFieldService {
    constructor(@InjectRepository(CalendarEntity) protected repository: Repository<CalendarEntity>) {
        super(repository, CalendarEntity, CreateCalendarDto, UpdateCalendarDto, CalendarParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: CalendarFilterDto): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder()
            .where({
                field_id: fieldId,
                // todo
            })
            .getMany();

        return result.map(r => r.advert_id);
    }
}
