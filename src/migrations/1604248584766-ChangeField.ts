import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeField1604248584766 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'fields',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );

        await queryRunner.dropColumn('fields', 'created_at');
        await queryRunner.dropColumn('fields', 'updated_at');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'fields',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );

        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'created_at',
                type: 'timestamp',
                default: 'NOW()',
            })
        );
        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'updated_at',
                type: 'timestamp',
                default: 'NOW()',
            })
        );
    }
}
