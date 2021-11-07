import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ProductBlockReason1636312021372 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'reason',
                type: 'varchar',
                length: '1000',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'reason');
    }
}
