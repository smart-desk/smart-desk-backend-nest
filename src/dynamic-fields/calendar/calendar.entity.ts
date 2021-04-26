import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_calendar')
export class CalendarEntity extends DynamicFieldsBaseEntity {
    @Column('timestamp with time zone')
    date1: Date;

    @Column('timestamp with time zone')
    date2: Date;
}
