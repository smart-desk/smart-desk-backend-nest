import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressRollback1614290358727 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('address');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
