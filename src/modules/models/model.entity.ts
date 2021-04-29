import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Section } from '../sections/section.entity';

@Entity('models')
export class Model {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    name: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    @OneToMany(() => Section, (section: Section) => section.model, { eager: true })
    sections: Section[];
}
