import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/section.entity';
import { InputText, Radio, Textarea, Text } from './field-params';
import { FieldType } from './constants';

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
    params: InputText | Textarea | Text | Radio;

    data: unknown;

    @ManyToOne(() => Section, (section: Section) => section.fields)
    @JoinColumn({ name: 'section_id' })
    section: Section;
}
