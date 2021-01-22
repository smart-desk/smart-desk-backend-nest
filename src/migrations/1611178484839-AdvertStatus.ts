import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdvertStatus1611178484839 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'adverts',
            new TableColumn({
                name: 'status',
                type: 'varchar',
                length: '255',
                default: "'active'",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('adverts', 'status');
    }

}
