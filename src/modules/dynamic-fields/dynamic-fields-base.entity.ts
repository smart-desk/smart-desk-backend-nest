import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class DynamicFieldsBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'product_id' })
    productId: string;

    @Column('uuid', { name: 'field_id' })
    fieldId: string;
}
