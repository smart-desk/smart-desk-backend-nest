import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_calendar')
export class CalendarEntity extends DynamicFieldsBaseEntity {
    @Column('boolean')
    range: boolean;

    @Column('timestamp with time zone')
    date1: Date;

    @Column({
        type: 'timestamp with time zone',
        transformer: {
            from(value) {
                return value;
            },
            to(value: string): Date {
                return new Date(value);
            },
        },
    })
    date2: Date;
}
