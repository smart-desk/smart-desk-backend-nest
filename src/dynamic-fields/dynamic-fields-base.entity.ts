import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class DynamicFieldsBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    advert_id: string;

    @Column('uuid')
    field_id: string;
}
