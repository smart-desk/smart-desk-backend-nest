import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class PromoTable1626813875910 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'promos',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isUnique: true,
                        generationStrategy: 'uuid',
                        default: `uuid_generate_v4()`,
                    },
                    {
                        name: 'promo_set_id',
                        type: 'uuid',
                    },
                    {
                        name: 'product_id',
                        type: 'uuid',
                    },
                    {
                        name: 'start_date',
                        type: 'timestamp',
                    },
                    {
                        name: 'end_date',
                        type: 'timestamp',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '100',
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'promos',
            new TableForeignKey({
                columnNames: ['promo_set_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'promo_sets',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'promos',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('promos');
    }
}
