import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserEmailPref1622409887271 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email_notifications',
                type: 'varchar',
                isArray: true,
                length: '100',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'email_notifications');
    }
}
