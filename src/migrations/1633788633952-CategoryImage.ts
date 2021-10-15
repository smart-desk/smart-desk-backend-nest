import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CategoryImage1633788633952 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'categories',
            new TableColumn({
                name: 'img',
                type: 'varchar',
                length: '1000',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('categories', 'img');
    }
}
