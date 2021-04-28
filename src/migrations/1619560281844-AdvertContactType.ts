import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdvertContactType1619560281844 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'adverts',
            new TableColumn({
                name: 'prefer_contact',
                type: 'varchar',
                length: '100',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('adverts', 'prefer_contact');
    }
}
