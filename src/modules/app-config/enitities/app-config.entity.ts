import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_config')
export class AppConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    logo?: string;
}
