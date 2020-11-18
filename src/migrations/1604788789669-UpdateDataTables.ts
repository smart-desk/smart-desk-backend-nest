import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateDataTables1604788789669 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tables = ['data_input_texts', 'data_textareas', 'data_radios'];

        for (const table of tables) {
            await queryRunner.changeColumn(
                table,
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

            await queryRunner.dropColumn(table, 'created_at');
            await queryRunner.dropColumn(table, 'updated_at');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = ['data_input_texts', 'data_textareas', 'data_radios'];

        for (const table of tables) {
            await queryRunner.changeColumn(
                table,
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
                table,
                new TableColumn({
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'NOW()',
                })
            );
            await queryRunner.addColumn(
                table,
                new TableColumn({
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'NOW()',
                })
            );
        }
    }
}
