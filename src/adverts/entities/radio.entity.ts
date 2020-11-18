import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_radios')
export class RadioEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    advert_id: string;

    @Column('uuid')
    field_id: string;

    @Column('varchar', { length: 255 })
    value: string;
}
