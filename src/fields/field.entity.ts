import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/section.entity';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

@Entity('fields')
export class Field {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('varchar', { length: 255 })
    type: FieldType;

    @Column('uuid')
    section_id: string;

    @Column('json')
    params: unknown;

    data: unknown;

    @ManyToOne(() => Section, (section: Section) => section.fields)
    @JoinColumn({ name: 'section_id' })
    section: Section;
}
