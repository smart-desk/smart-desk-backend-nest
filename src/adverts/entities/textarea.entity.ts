import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_textareas')
export class TextareaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    advert_id: string;

    @Column('uuid')
    field_id: string;

    @Column('varchar', { length: 1000 })
    value: string;
}
