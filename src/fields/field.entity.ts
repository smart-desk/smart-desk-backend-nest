import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/section.entity';
import { FieldType } from './constants';
import { TextParamsDto } from '../dynamic-fields/text/dto/text-params.dto';
import { TextareaParamsDto } from '../dynamic-fields/textarea/dto/textarea-params.dto';
import { RadioParamsDto } from '../dynamic-fields/radio/dto/radio-params.dto';
import { InputTextParamsDto } from '../dynamic-fields/input-text/dto/input-text-params.dto';

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
