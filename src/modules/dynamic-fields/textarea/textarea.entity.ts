import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_textareas')
export class TextareaEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 1000 })
    value: string;
}
