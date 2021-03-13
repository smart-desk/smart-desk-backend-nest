import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_checkboxes')
export class CheckboxEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 255 })
    value: string;
}
