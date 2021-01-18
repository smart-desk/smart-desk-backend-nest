import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserStatus1610908755396 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'status',
                type: 'varchar',
                length: '255',
                default: "'active'",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'status');
    }
}
