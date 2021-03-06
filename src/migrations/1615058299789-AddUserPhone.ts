import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserPhone1615058299789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'phone',
                type: 'varchar',
                length: '255',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'is_phone_verified',
                type: 'boolean',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'phone');
        await queryRunner.dropColumn('users', 'is_phone_verified');
    }
}
