import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddJsonToField1604260217576 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'params',
                type: 'json',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('fields', 'params');
    }
}
