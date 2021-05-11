import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class RemoveSection1620682654609 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'section',
                type: 'varchar',
                length: '100',
                default: "'params'",
            })
        );

        await queryRunner.addColumn(
            'fields',
            new TableColumn({
                name: 'model_id',
                type: 'uuid',
                isNullable: true
            })
        );

        await queryRunner.createForeignKey(
            'fields',
            new TableForeignKey({
                columnNames: ['model_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'models',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.query('UPDATE fields SET section = s.type, model_id = s.model_id FROM sections s WHERE section_id = s.id');

        await queryRunner.changeColumn(
            'fields',
            'model_id',
            new TableColumn({
                name: 'model_id',
                type: 'uuid',
                isNullable: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('fields', 'section');
    }

}
