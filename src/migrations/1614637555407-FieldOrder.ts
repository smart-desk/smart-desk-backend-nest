import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FieldOrder1614637555407 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'order',
                type: 'int',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('fields', 'order');
    }
}
