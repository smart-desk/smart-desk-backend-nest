import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

@Entity('fields')
export class Field {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'model_id' })
    modelId: string;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('varchar', { length: 255 })
    type: FieldType;

    @Column('varchar', { length: 100 })
    section: string;

    @Column('json')
    params: unknown;

    @Column('boolean')
    filterable: boolean;

    @Column('int')
    order: number;

    @Column('boolean')
    required: boolean;

    data: unknown;
}
