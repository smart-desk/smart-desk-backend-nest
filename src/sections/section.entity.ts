import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Model } from '../models/model.entity';

export enum SectionType {
    PARAMS = 'params',
    CONTACTS = 'contacts',
    LOCATION = 'location',
    PRICE = 'price',
}

@Entity('sections')
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    type: SectionType;

    @Column('uuid')
    model_id: string;

    @ManyToOne(() => Model, (model: Model) => model.sections)
    @JoinColumn({ name: 'model_id' })
    model: Model;
}
