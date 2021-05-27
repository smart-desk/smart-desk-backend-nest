import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserVkId1622151902293 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'vk_id',
                type: 'varchar',
                length: '100',
                isNullable: true,
            })
        );

        await queryRunner.changeColumn(
            'users',
            'email',
            new TableColumn({
                name: 'email',
                type: 'varchar',
                length: '255',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'vk_id');

        await queryRunner.changeColumn(
            'users',
            'email',
            new TableColumn({
                name: 'email',
                type: 'varchar',
                length: '255',
                isNullable: false,
            })
        );
    }
}
