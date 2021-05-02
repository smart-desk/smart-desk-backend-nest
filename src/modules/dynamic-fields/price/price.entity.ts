import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_price')
export class PriceEntity extends DynamicFieldsBaseEntity {
    @Column('decimal', { precision: 13, scale: 2 })
    value: number;
}
