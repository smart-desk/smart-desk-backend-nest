import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../sections/section.entity';
import { FieldType } from './constants';
import { TextDto } from './dto/text.dto';
import { TextareaDto } from './dto/textarea.dto';
import { RadioDto } from './dto/radio.dto';
import { InputTextDto } from './dto/input-text.dto';

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
    params: InputTextDto | TextareaDto | TextDto | RadioDto;

    data: unknown;

    @ManyToOne(() => Section, (section: Section) => section.fields)
    @JoinColumn({ name: 'section_id' })
    section: Section;
}
