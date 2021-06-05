import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AdCampaigns1622927251266 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'ad_campaigns',
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
                        name: 'start_date',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'end_date',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'start_time',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'end_time',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'img',
                        type: 'varchar',
                        length: '1000',
                    },
                    {
                        name: 'link',
                        type: 'varchar',
                        length: '1000',
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'reason',
                        type: 'varchar',
                        length: '1000',
                        isNullable: true,
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('ad_campaigns');
    }
}
