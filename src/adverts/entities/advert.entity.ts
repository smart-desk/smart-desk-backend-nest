import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Section } from '../../sections/section.entity';

@Entity('adverts')
export class Advert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    category_id: string;

    @Column('uuid')
    model_id: string;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('varchar', { length: 255 })
    status: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    sections: Section[];
}
