import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { DatepickerEntity } from './datepicker.entity';
import { CreateDatepickerDto } from './dto/create-datepicker.dto';
import { UpdateDatepickerDto } from './dto/update-datepicker.dto';
import { DatepickerParamsDto } from './dto/datepicker-params.dto';
import { DatepickerFilterDto } from './dto/datepicker-filter.dto';
import dayjs from 'dayjs';

@Injectable()
export class DatepickerService extends BaseFieldService {
    constructor(@InjectRepository(DatepickerEntity) protected repository: Repository<DatepickerEntity>) {
        super(repository, DatepickerEntity, CreateDatepickerDto, UpdateDatepickerDto, DatepickerParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: DatepickerFilterDto): Promise<string[]> {
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
