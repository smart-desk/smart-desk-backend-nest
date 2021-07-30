import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FacebookId1627683206697 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'facebook_id',
                type: 'varchar',
                length: '100',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'facebook_id');
    }
}
