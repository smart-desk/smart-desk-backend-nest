import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CalendarEntity } from './calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarParamsDto } from './dto/calendar-params.dto';
import { CalendarFilterDto } from './dto/calendar-filter.dto';
import dayjs from 'dayjs';

@Injectable()
export class CalendarService extends BaseFieldService {
    constructor(@InjectRepository(CalendarEntity) protected repository: Repository<CalendarEntity>) {
        super(repository, CalendarEntity, CreateCalendarDto, UpdateCalendarDto, CalendarParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: CalendarFilterDto): Promise<string[]> {
        const query = this.repository.createQueryBuilder().where({
            field_id: fieldId,
        });

        if (params.from) {
            query.where({
                date1: MoreThan(dayjs(params.from).toISOString()),
            });
        }
        if (params.to) {
            query.where({
                date1: LessThan(dayjs(params.from).toISOString()),
            });
        }

        const result = await query.getMany();

        return result.map(r => r.advert_id);
    }
}
