import { Column, Entity } from 'typeorm';
import { DynamicFieldsBaseEntity } from '../dynamic-fields-base.entity';

@Entity('data_locations')
export class LocationEntity extends DynamicFieldsBaseEntity {
    @Column('varchar', { length: 255 })
    title: number;

    @Column('float')
    lat: number;

    @Column('float')
    lng: number;
}
