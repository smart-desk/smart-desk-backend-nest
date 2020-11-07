import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_input_texts')
export class InputTextEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    advert_id: string;

    @Column('uuid')
    field_id: string;

    @Column('varchar', { length: 255 })
    value: string;
}
