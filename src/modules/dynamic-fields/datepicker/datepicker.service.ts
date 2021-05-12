import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatepickerEntity } from './datepicker.entity';
import { CreateDatepickerDto } from './dto/create-datepicker.dto';
import { UpdateDatepickerDto } from './dto/update-datepicker.dto';
import { DatepickerParamsDto } from './dto/datepicker-params.dto';
import { DatepickerFilterDto } from './dto/datepicker-filter.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class DatepickerService extends BaseFieldService {
    constructor(@InjectRepository(DatepickerEntity) protected repository: Repository<DatepickerEntity>) {
        super(repository, DatepickerEntity, CreateDatepickerDto, UpdateDatepickerDto, DatepickerParamsDto);
    }

    async getAdvertIdsByFilter(fieldId: string, params: DatepickerFilterDto): Promise<string[]> {
        const query = this.repository.createQueryBuilder('d').where({
            field_id: fieldId,
        });

        if (params.from) {
            query.andWhere('d.date1 >= :from', { from: dayjs(params.from).toISOString() });
            query.setParameter('from', dayjs(params.from).toISOString());
        }
        if (params.to) {
            query.andWhere('d.date1 < :to');
            query.setParameter('to', dayjs(params.to).toISOString());
        }

        if (params.range) {
            if (params.from) {
                query.andWhere('d.date2 >= :from', { from: dayjs(params.from).toISOString() });
                query.setParameter('from', dayjs(params.from).toISOString());
            }
            if (params.to) {
                query.andWhere('d.date2 < :to');
                query.setParameter('to', dayjs(params.to).toISOString());
            }
        }

        const result = await query.getMany();
        return result.map(r => r.advert_id);
    }
}
