import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_photos')
export class PhotoEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 1000, array: true })
    value: string[];
}
