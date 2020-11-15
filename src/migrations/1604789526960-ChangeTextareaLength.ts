import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeTextareaLength1604789526960 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'data_textareas',
            'value',
            new TableColumn({
                name: 'value',
                type: 'varchar',
                length: '1000',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'data_textareas',
            'value',
            new TableColumn({
                name: 'value',
                type: 'varchar',
                length: '255',
                isNullable: true,
            })
        );
    }
}
