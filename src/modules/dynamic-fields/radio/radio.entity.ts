import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_radios')
export class RadioEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 255 })
    value: string;
}
