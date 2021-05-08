import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FieldRequired1620505012010 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'required',
                type: 'boolean',
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('fields', 'required');
    }
}
