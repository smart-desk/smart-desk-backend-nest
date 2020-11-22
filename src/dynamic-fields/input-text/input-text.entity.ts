import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_input_texts')
export class InputTextEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 255 })
    value: string;
}
