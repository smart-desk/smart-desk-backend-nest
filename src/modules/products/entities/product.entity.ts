import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PreferContact } from '../models/prefer-contact.enum';
import { Field } from '../../fields/field.entity';

@Entity('products')
export class Product {
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

    @Column('varchar', { length: 1000 })
    reason: string;

    @Column('integer')
    views: number;

    @Column('varchar', { name: 'prefer_contact', length: 100 })
    preferContact: PreferContact;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    @Column({ name: 'promotion_timestamp', type: 'timestamp with time zone' })
    promotionTimestamp: Date;

    fields: Field[];
}
