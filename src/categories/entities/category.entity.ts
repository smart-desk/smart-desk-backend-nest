import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'model_id' })
    modelId: string;

    @Column('uuid', { name: 'parent_id' })
    parentId: string;

    @Column('varchar', { length: 255 })
    name: string;

    @ManyToOne(() => Category, category => category.children)
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];

    @Column('date', { name: 'created_at' })
    createdAt: string;

    @Column('date', { name: 'updated_at' })
    updatedAt: string;
}
