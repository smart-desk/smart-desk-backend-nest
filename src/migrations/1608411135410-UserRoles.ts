import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserRoles1608411135410 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'roles',
                isArray: true,
                type: 'varchar',
                length: '255',
                default: 'ARRAY[]::varchar[]',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'roles');
    }
}
